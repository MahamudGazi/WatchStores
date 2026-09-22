from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "phone",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = True
        user.save()
        return user 
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(validators=[validate_password])


class EmailVerifySerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)


class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "profile_image",
            "is_active",
            "is_staff",
            "is_email_verified",
            "role",
            "date_joined",
        ]
        read_only_fields = [
            "id",
            "is_staff",
            "is_email_verified",
            "role",
            "date_joined",
        ]

    def get_role(self, obj):
        if obj.is_superuser:
            return "SUPER_ADMIN"

        if not obj.is_staff:
            return "CUSTOMER"

        if obj.groups.filter(name="Staff").exists():
            return "STAFF"

        if obj.groups.filter(name="Admin").exists():
            return "ADMIN"

        # Backward compatibility:
        # existing staff users without a group remain ADMIN
        return "ADMIN"


class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8
    )

    role = serializers.ChoiceField(
        choices=[
            ("ADMIN", "Admin"),
            ("STAFF", "Staff"),
        ],
        required=True,
        write_only=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone",
            "password",
            "profile_image",
            "is_active",
            "role",
        ]

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_username(self, value):
        value = value.strip()

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )

        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")

        user = User(**validated_data)

        user.set_password(password)

        # Admin and Staff both require staff access
        user.is_staff = True

        # Staff/Admin created by this API are active by default
        if "is_active" not in validated_data:
            user.is_active = True

        user.save()

        admin_group, _ = Group.objects.get_or_create(
            name="Admin"
        )

        staff_group, _ = Group.objects.get_or_create(
            name="Staff"
        )

        # Remove both before assigning correct role
        user.groups.remove(
            admin_group,
            staff_group
        )

        if role == "ADMIN":
            user.groups.add(admin_group)

        elif role == "STAFF":
            user.groups.add(staff_group)

        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=False)

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        confirm = attrs.get("new_password_confirm")
        if confirm is not None and new_password != confirm:
            raise serializers.ValidationError(
                {"new_password_confirm": "Passwords do not match."}
            )
        return attrs


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "username"

    def validate(self, attrs):
        username_or_email = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username_or_email,
            password=password,
        )

        if user is None:
            try:
                user_obj = User.objects.get(
                    email__iexact=username_or_email
                )
            except User.DoesNotExist:
                user_obj = None

            if user_obj is not None:
                user = authenticate(
                    username=user_obj.username,
                    password=password,
                )

        if user is None:
            raise serializers.ValidationError(
                "No active account found with the given credentials."
            )

        data = super().validate(
            {
                "username": user.username,
                "password": password,
            }
        )

        return data