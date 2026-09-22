from rest_framework.throttling import ScopedRateThrottle


class LoginRateThrottle(ScopedRateThrottle):
    scope = "login"


class PasswordResetOTPThrottle(ScopedRateThrottle):
    scope = "password_reset_otp"


class EmailVerificationOTPThrottle(ScopedRateThrottle):
    scope = "email_verification_otp"

class EmailVerificationResendThrottle(ScopedRateThrottle):
    scope = "email_verification_resend"

class PasswordResetResendThrottle(ScopedRateThrottle):
    scope = "password_reset_resend"