from io import BytesIO

from django.core.exceptions import ValidationError
from PIL import Image


MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_TYPES = {
    "JPEG",
    "PNG",
    "WEBP",
}


def validate_return_image(image):
    """
    Validate customer-uploaded return images.

    Rules:
    - Maximum 5 MB
    - JPEG, PNG, WEBP only
    - Must be a valid image
    """

    if not image:
        raise ValidationError(
            "Image file is required."
        )

    if image.size > MAX_IMAGE_SIZE:
        raise ValidationError(
            "Image size must not exceed 5 MB."
        )

    try:
        image_data = image.read()

        with Image.open(
            BytesIO(image_data)
        ) as img:

            img.verify()

            if img.format not in ALLOWED_IMAGE_TYPES:
                raise ValidationError(
                    "Only JPEG, PNG, and WEBP images are allowed."
                )

    except (OSError, ValueError):
        raise ValidationError(
            "Invalid or corrupted image file."
        )

    finally:
        image.seek(0)