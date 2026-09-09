import { useEffect, useMemo, useState } from "react";

import {
    getAdminProducts,
    getBrands,
    getCategories,
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    uploadProductImage,
    deleteProductImage,
    updateProductImage,
    getProductImages,
} from "../../../api/admin";


const INITIAL_FORM = {
    brand: "",
    category: "",
    name: "",
    sku: "",
    short_description: "",
    description: "",
    price: "",
    discount_price: "",
    stock: 0,
    is_featured: false,
    is_active: true,
    is_flash_sale: false,
    thumbnail: null,
};


export default function AdminProducts() {
    // =========================================================
    // PRODUCTS
    // =========================================================

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // =========================================================
    // MODAL
    // =========================================================

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // =========================================================
    // FORM
    // =========================================================

    const [form, setForm] = useState(INITIAL_FORM);

    // =========================================================
    // GALLERY
    // =========================================================

    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);

    const [galleryLoading, setGalleryLoading] = useState(false);

    const [editingGalleryImage, setEditingGalleryImage] =
        useState(null);

    const [galleryAltText, setGalleryAltText] =
        useState("");

    const [galleryNewFile, setGalleryNewFile] =
        useState(null);

    const [galleryActionLoading, setGalleryActionLoading] =
        useState(false);


    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        loadData();
    }, []);


    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const [
                productsData,
                brandsData,
                categoriesData,
            ] = await Promise.all([
                getAdminProducts(),
                getBrands(),
                getCategories(),
            ]);

            setProducts(
                Array.isArray(productsData)
                    ? productsData
                    : productsData?.results || []
            );

            setBrands(
                Array.isArray(brandsData)
                    ? brandsData
                    : brandsData?.results || []
            );

            setCategories(
                Array.isArray(categoriesData)
                    ? categoriesData
                    : categoriesData?.results || []
            );

        } catch (err) {
            console.error("Failed to load admin product data:", err);

            setError(
                extractApiError(
                    err,
                    "Failed to load products."
                )
            );

        } finally {
            setLoading(false);
        }
    }


    // =========================================================
    // RESET FORM
    // =========================================================

    function resetForm() {
        setForm({
            ...INITIAL_FORM,
        });
    }


    // =========================================================
    // CLEAR GALLERY
    // =========================================================

    function clearGalleryState() {
        setGalleryFiles([]);
        setGalleryPreviews([]);
        setGalleryImages([]);

        setEditingGalleryImage(null);
        setGalleryAltText("");
        setGalleryNewFile(null);

        setGalleryLoading(false);
        setGalleryActionLoading(false);
    }


    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    function openAddModal() {
        setEditingProduct(null);

        resetForm();
        clearGalleryState();

        setError("");
        setShowModal(true);
    }


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    function closeModal() {
        if (saving || galleryActionLoading) {
            return;
        }

        if (
            galleryFiles.length > 0 &&
            !window.confirm(
                "You selected gallery images that have not been uploaded yet. Close anyway?"
            )
        ) {
            return;
        }

        setShowModal(false);
        setEditingProduct(null);

        resetForm();
        clearGalleryState();

        setError("");
    }


    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    async function openEditModal(product) {
        setEditingProduct(product);

        setError("");

        setForm({
            brand: product.brand ?? "",
            category: product.category ?? "",
            name: product.name ?? "",
            sku: product.sku ?? "",
            short_description:
                product.short_description ?? "",
            description:
                product.description ?? "",
            price: product.price ?? "",
            discount_price:
                product.discount_price ?? "",
            stock: product.stock ?? 0,
            is_featured:
                product.is_featured ?? false,
            is_active:
                product.is_active ?? true,
            is_flash_sale:
                product.is_flash_sale ?? false,
            thumbnail: null,
        });

        setGalleryFiles([]);
        setGalleryPreviews([]);

        setGalleryImages([]);
        setEditingGalleryImage(null);
        setGalleryAltText("");
        setGalleryNewFile(null);

        setShowModal(true);

        // Load gallery
        try {
            setGalleryLoading(true);

            const images = await getProductImages(product.id);

            setGalleryImages(
                Array.isArray(images)
                    ? images
                    : images?.results || []
            );

        } catch (err) {
            console.error(
                "Failed to load gallery images:",
                err
            );

            setGalleryImages([]);

            setError(
                "Product loaded, but gallery images could not be loaded."
            );

        } finally {
            setGalleryLoading(false);
        }
    }


    // =========================================================
    // FORM CHANGE
    // =========================================================

    function handleChange(e) {
        const {
            name,
            value,
            type,
            checked,
            files,
        } = e.target;

        if (type === "checkbox") {
            setForm((prev) => ({
                ...prev,
                [name]: checked,
            }));

            return;
        }

        if (type === "file") {
            setForm((prev) => ({
                ...prev,
                [name]: files?.[0] || null,
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }


    // =========================================================
    // GALLERY FILE CHANGE
    // =========================================================

    function handleGalleryChange(e) {
        const files = Array.from(
            e.target.files || []
        );

        // Clear old previews
        setGalleryPreviews((oldPreviews) => {
            oldPreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });

            return [];
        });

        if (files.length === 0) {
            setGalleryFiles([]);
            return;
        }

        setGalleryFiles(files);

        const previews = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setGalleryPreviews(previews);

        // Reset input so selecting the same file again works
        e.target.value = "";
    }


    // =========================================================
    // CLEAN PREVIEW URLS
    // =========================================================

    useEffect(() => {
        return () => {
            galleryPreviews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [galleryPreviews]);


    // =========================================================
    // VALIDATE FORM
    // =========================================================

    function validateForm() {
        if (!form.brand) {
            return "Please select a brand.";
        }

        if (!form.category) {
            return "Please select a category.";
        }

        if (!form.name.trim()) {
            return "Product name is required.";
        }

        if (!form.sku.trim()) {
            return "SKU is required.";
        }

        if (
            !form.price ||
            Number(form.price) <= 0
        ) {
            return "Price must be greater than 0.";
        }

        if (
            form.discount_price !== "" &&
            Number(form.discount_price) < 0
        ) {
            return "Discount price cannot be negative.";
        }

        if (
            form.discount_price !== "" &&
            Number(form.discount_price) >= Number(form.price)
        ) {
            return "Discount price must be lower than regular price.";
        }

        if (Number(form.stock) < 0) {
            return "Stock cannot be negative.";
        }

        if (!form.short_description.trim()) {
            return "Short description is required.";
        }

        if (form.short_description.length > 300) {
            return "Short description cannot exceed 300 characters.";
        }

        if (!form.description.trim()) {
            return "Description is required.";
        }

        return null;
    }


    // =========================================================
    // BUILD PRODUCT FORM DATA
    // =========================================================

    function buildProductFormData() {
        const formData = new FormData();

        formData.append(
            "brand",
            form.brand
        );

        formData.append(
            "category",
            form.category
        );

        formData.append(
            "name",
            form.name.trim()
        );

        formData.append(
            "sku",
            form.sku.trim()
        );

        formData.append(
            "short_description",
            form.short_description.trim()
        );

        formData.append(
            "description",
            form.description.trim()
        );

        formData.append(
            "price",
            form.price
        );

        // Important:
        // Send empty value during update if discount is removed.
        formData.append(
            "discount_price",
            form.discount_price || ""
        );

        formData.append(
            "stock",
            form.stock
        );

        formData.append(
            "is_featured",
            String(form.is_featured)
        );

        formData.append(
            "is_active",
            String(form.is_active)
        );

        formData.append(
            "is_flash_sale",
            String(form.is_flash_sale)
        );

        if (form.thumbnail instanceof File) {
            formData.append(
                "thumbnail",
                form.thumbnail
            );
        }

        return formData;
    }


    // =========================================================
    // HANDLE PRODUCT SUBMIT
    // =========================================================

    async function handleSubmit(e) {
        e.preventDefault();

        if (saving) {
            return;
        }

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const formData =
                buildProductFormData();

            let savedProduct;

            // =================================================
            // UPDATE
            // =================================================

            if (editingProduct) {
                savedProduct =
                    await updateAdminProduct(
                        editingProduct.id,
                        formData
                    );

            }

            // =================================================
            // CREATE
            // =================================================

            else {
                savedProduct =
                    await createAdminProduct(
                        formData
                    );
            }

            // =================================================
            // UPLOAD GALLERY
            // =================================================

            let galleryUploadError = "";

            if (
                galleryFiles.length > 0 &&
                savedProduct?.id
            ) {
                for (
                    const file
                    of galleryFiles
                ) {
                    try {
                        await uploadProductImage(
                            savedProduct.id,
                            file
                        );

                    } catch (galleryError) {
                        console.error(
                            "Gallery upload failed:",
                            galleryError
                        );

                        galleryUploadError =
                            extractApiError(
                                galleryError,
                                `Failed to upload ${file.name}.`
                            );
                    }
                }
            }


            // =================================================
            // REFRESH GALLERY
            // =================================================

            if (savedProduct?.id) {
                try {
                    const updatedGallery =
                        await getProductImages(
                            savedProduct.id
                        );

                    setGalleryImages(
                        Array.isArray(
                            updatedGallery
                        )
                            ? updatedGallery
                            : updatedGallery?.results || []
                    );

                } catch (galleryLoadError) {
                    console.error(
                        "Gallery refresh failed:",
                        galleryLoadError
                    );
                }
            }


            // =================================================
            // REFRESH PRODUCT LIST
            // =================================================

            await loadData();


            // =================================================
            // SUCCESS
            // =================================================

            if (galleryUploadError) {
                setError(
                    `Product saved successfully, but ${galleryUploadError}`
                );

                // Keep modal open so user can inspect gallery
                setEditingProduct(
                    savedProduct
                );

                setGalleryFiles([]);
                setGalleryPreviews([]);

                return;
            }


            // =================================================
            // CLOSE MODAL
            // =================================================

            setShowModal(false);

            setEditingProduct(null);

            resetForm();
            clearGalleryState();

        } catch (err) {
            console.error(
                "Product save error:",
                err
            );

            setError(
                extractApiError(
                    err,
                    "Failed to save product."
                )
            );

        } finally {
            setSaving(false);
        }
    }


    // =========================================================
    // DELETE PRODUCT
    // =========================================================

    async function handleDelete(product) {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${product.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteAdminProduct(
                product.id
            );

            setProducts((prev) =>
                prev.filter(
                    (item) =>
                        item.id !== product.id
                )
            );

        } catch (err) {
            console.error(
                "Delete product error:",
                err
            );

            alert(
                extractApiError(
                    err,
                    "Failed to delete product."
                )
            );
        }
    }


    // =========================================================
    // EDIT GALLERY IMAGE
    // =========================================================

    function handleEditGalleryImage(image) {
        setEditingGalleryImage(image);

        setGalleryAltText(
            image.alt_text || ""
        );

        setGalleryNewFile(null);
    }


    // =========================================================
    // CANCEL GALLERY EDIT
    // =========================================================

    function cancelGalleryEdit() {
        if (galleryActionLoading) {
            return;
        }

        setEditingGalleryImage(null);
        setGalleryAltText("");
        setGalleryNewFile(null);
    }


    // =========================================================
    // UPDATE GALLERY IMAGE
    // =========================================================

    async function handleUpdateGalleryImage() {
        if (galleryActionLoading) {
            return;
        }

        if (
            !editingProduct ||
            !editingGalleryImage
        ) {
            return;
        }

        const originalAlt =
            editingGalleryImage.alt_text || "";

        const newAlt =
            galleryAltText.trim();

        const altChanged =
            newAlt !== originalAlt;

        const imageChanged =
            galleryNewFile instanceof File;

        if (!altChanged && !imageChanged) {
            alert(
                "Please change the image or enter different alt text."
            );

            return;
        }

        try {
            setGalleryActionLoading(true);

            const updatedImage =
                await updateProductImage(
                    editingProduct.id,
                    editingGalleryImage.id,
                    galleryNewFile,
                    newAlt
                );

            setGalleryImages((prev) =>
                prev.map((image) =>
                    image.id === updatedImage.id
                        ? updatedImage
                        : image
                )
            );

            setEditingGalleryImage(null);
            setGalleryAltText("");
            setGalleryNewFile(null);

        } catch (err) {
            console.error(
                "Gallery update error:",
                err
            );

            alert(
                extractApiError(
                    err,
                    "Failed to update gallery image."
                )
            );

        } finally {
            setGalleryActionLoading(false);
        }
    }


    // =========================================================
    // DELETE GALLERY IMAGE
    // =========================================================

    async function handleDeleteGalleryImage(
        imageId
    ) {
        if (galleryActionLoading) {
            return;
        }

        if (!editingProduct) {
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this gallery image?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setGalleryActionLoading(true);

            await deleteProductImage(
                editingProduct.id,
                imageId
            );

            setGalleryImages((prev) =>
                prev.filter(
                    (image) =>
                        image.id !== imageId
                )
            );

            if (
                editingGalleryImage?.id ===
                imageId
            ) {
                setEditingGalleryImage(null);
                setGalleryAltText("");
                setGalleryNewFile(null);
            }

        } catch (err) {
            console.error(
                "Gallery delete error:",
                err
            );

            alert(
                extractApiError(
                    err,
                    "Failed to delete gallery image."
                )
            );

        } finally {
            setGalleryActionLoading(false);
        }
    }


    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    const filteredProducts =
        useMemo(() => {
            const text =
                search
                    .trim()
                    .toLowerCase();

            if (!text) {
                return products;
            }

            return products.filter(
                (product) =>
                    product.name
                        ?.toLowerCase()
                        .includes(text) ||
                    product.sku
                        ?.toLowerCase()
                        .includes(text) ||
                    product.brand_name
                        ?.toLowerCase()
                        .includes(text) ||
                    product.category_name
                        ?.toLowerCase()
                        .includes(text)
            );
        }, [products, search]);


    // =========================================================
    // STOCK STYLE
    // =========================================================

    function getStockStyle(stock) {
        const value =
            Number(stock);

        if (value === 0) {
            return "bg-red-100 text-red-700";
        }

        if (value <= 5) {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-green-100 text-green-700";
    }


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Product Management
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                        Manage your store products
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    disabled={saving}
                    className="
                        w-full sm:w-auto
                        bg-black hover:bg-gray-800
                        disabled:bg-gray-400
                        text-white
                        px-5 py-3
                        rounded-xl
                        font-semibold
                        transition
                    "
                >
                    + Add Product
                </button>

            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
                <div className="
                    mb-6
                    bg-red-50
                    border border-red-200
                    text-red-700
                    p-4
                    rounded-xl
                ">
                    <p className="font-semibold">
                        Error
                    </p>

                    <p className="text-sm mt-1">
                        {error}
                    </p>
                </div>
            )}


            {/* ================================================= */}
            {/* SEARCH */}
            {/* ================================================= */}

            <div className="
                bg-white
                rounded-xl
                shadow
                p-3 sm:p-4
                mb-6
            ">

                <input
                    type="text"
                    placeholder="Search product, SKU, brand or category..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="
                        w-full
                        border
                        rounded-lg
                        px-4 py-3
                        text-sm sm:text-base
                        focus:outline-none
                        focus:ring-2
                        focus:ring-black
                    "
                />

            </div>


            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    p-10
                    text-center
                ">

                    <div className="
                        animate-spin
                        rounded-full
                        h-10 w-10
                        border-b-4
                        border-black
                        mx-auto
                    " />

                    <p className="text-gray-500 mt-4">
                        Loading products...
                    </p>

                </div>

            ) : (

                <div className="
                    bg-white
                    rounded-xl
                    shadow
                    overflow-hidden
                ">

                    <div className="
                        overflow-x-auto
                        scrollbar-thin
                        scrollbar-thumb-gray-400
                    ">

                        <table className="w-full min-w-[1000px]">

                            <thead className="
                                bg-black
                                text-white
                            ">

                                <tr>

                                    <th className="p-4 text-left">
                                        Product
                                    </th>

                                    <th className="p-4 text-left">
                                        SKU
                                    </th>

                                    <th className="p-4 text-left">
                                        Category
                                    </th>

                                    <th className="p-4 text-left">
                                        Price
                                    </th>

                                    <th className="p-4 text-left">
                                        Stock
                                    </th>

                                    <th className="p-4 text-left">
                                        Status
                                    </th>

                                    <th className="p-4 text-left">
                                        Features
                                    </th>

                                    <th className="p-4 text-left">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredProducts.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="
                                                p-10
                                                text-center
                                                text-gray-500
                                            "
                                        >
                                            No products found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredProducts.map(
                                        (product) => (

                                            <tr
                                                key={product.id}
                                                className="
                                                    border-b
                                                    hover:bg-gray-50
                                                    transition
                                                "
                                            >

                                                {/* Product */}

                                                <td className="p-4">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                    ">

                                                        {product.thumbnail ? (

                                                            <img
                                                                src={
                                                                    product.thumbnail
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="
                                                                    w-12 h-12
                                                                    sm:w-14 sm:h-14
                                                                    rounded-lg
                                                                    object-cover
                                                                    border
                                                                    shrink-0
                                                                "
                                                            />

                                                        ) : (

                                                            <div className="
                                                                w-12 h-12
                                                                sm:w-14 sm:h-14
                                                                rounded-lg
                                                                bg-gray-200
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-xs
                                                                text-gray-500
                                                                shrink-0
                                                            ">
                                                                No Image
                                                            </div>

                                                        )}

                                                        <div className="min-w-0">

                                                            <p className="
                                                                font-semibold
                                                                truncate
                                                                max-w-[180px]
                                                            ">
                                                                {product.name}
                                                            </p>

                                                            <p className="
                                                                text-sm
                                                                text-gray-500
                                                                truncate
                                                                max-w-[180px]
                                                            ">
                                                                {
                                                                    product.brand_name ||
                                                                    "-"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* SKU */}

                                                <td className="p-4">
                                                    {product.sku}
                                                </td>


                                                {/* Category */}

                                                <td className="p-4">
                                                    {
                                                        product.category_name ||
                                                        "-"
                                                    }
                                                </td>


                                                {/* Price */}

                                                <td className="p-4">

                                                    {product.discount_price ? (

                                                        <div>

                                                            <p className="
                                                                font-bold
                                                                text-green-600
                                                            ">
                                                                ৳{" "}
                                                                {
                                                                    product.discount_price
                                                                }
                                                            </p>

                                                            <p className="
                                                                text-sm
                                                                text-gray-400
                                                                line-through
                                                            ">
                                                                ৳{" "}
                                                                {
                                                                    product.price
                                                                }
                                                            </p>

                                                        </div>

                                                    ) : (

                                                        <span className="font-bold">
                                                            ৳{" "}
                                                            {
                                                                product.price
                                                            }
                                                        </span>

                                                    )}

                                                </td>


                                                {/* Stock */}

                                                <td className="p-4">

                                                    <span
                                                        className={`
                                                            px-3 py-1
                                                            rounded-full
                                                            text-sm
                                                            font-semibold
                                                            ${getStockStyle(
                                                            product.stock
                                                        )}
                                                        `}
                                                    >
                                                        {product.stock}
                                                    </span>

                                                </td>


                                                {/* Status */}

                                                <td className="p-4">

                                                    <span
                                                        className={`
                                                            px-3 py-1
                                                            rounded-full
                                                            text-sm
                                                            font-semibold
                                                            ${product.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            product.is_active
                                                                ? "Active"
                                                                : "Inactive"
                                                        }
                                                    </span>

                                                </td>


                                                {/* Features */}

                                                <td className="p-4">

                                                    <div className="
                                                        flex
                                                        gap-2
                                                        flex-wrap
                                                    ">

                                                        {product.is_featured && (
                                                            <span className="
                                                                bg-yellow-100
                                                                text-yellow-700
                                                                px-2 py-1
                                                                rounded
                                                                text-xs
                                                                font-semibold
                                                            ">
                                                                ⭐ Featured
                                                            </span>
                                                        )}

                                                        {product.is_flash_sale && (
                                                            <span className="
                                                                bg-pink-100
                                                                text-pink-700
                                                                px-2 py-1
                                                                rounded
                                                                text-xs
                                                                font-semibold
                                                            ">
                                                                ⚡ Flash Sale
                                                            </span>
                                                        )}

                                                        {!product.is_featured &&
                                                            !product.is_flash_sale && (
                                                                <span className="
                                                                    text-gray-400
                                                                    text-xs
                                                                ">
                                                                    —
                                                                </span>
                                                            )}

                                                    </div>

                                                </td>


                                                {/* Actions */}

                                                <td className="p-4">

                                                    <div className="
                                                        flex
                                                        gap-2
                                                        whitespace-nowrap
                                                    ">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    product
                                                                )
                                                            }
                                                            disabled={saving}
                                                            className="
                                                                bg-blue-500
                                                                hover:bg-blue-600
                                                                disabled:bg-blue-300
                                                                text-white
                                                                px-3 py-2
                                                                rounded-lg
                                                                text-sm
                                                            "
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product
                                                                )
                                                            }
                                                            disabled={saving}
                                                            className="
                                                                bg-red-500
                                                                hover:bg-red-600
                                                                disabled:bg-red-300
                                                                text-white
                                                                px-3 py-2
                                                                rounded-lg
                                                                text-sm
                                                            "
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}


            {/* ================================================= */}
            {/* PRODUCT MODAL */}
            {/* ================================================= */}

            {showModal && (

                <div className="
                    fixed inset-0
                    bg-black/60
                    backdrop-blur-sm
                    z-[100]
                    flex
                    items-end
                    sm:items-center
                    justify-center
                    p-0 sm:p-4
                ">

                    <div className="
                        bg-white
                        w-full
                        h-[95vh]
                        sm:h-auto
                        sm:max-h-[92vh]
                        sm:max-w-5xl
                        rounded-t-2xl
                        sm:rounded-2xl
                        shadow-2xl
                        overflow-y-auto
                    ">


                        {/* ================================================= */}
                        {/* MODAL HEADER */}
                        {/* ================================================= */}

                        <div className="
                            sticky top-0
                            z-30
                            bg-white/95
                            backdrop-blur
                            border-b
                            px-4 py-3
                            sm:px-5 sm:py-4
                            flex
                            items-center
                            justify-between
                        ">

                            <div className="min-w-0">

                                <h2 className="
                                    text-lg
                                    sm:text-xl
                                    md:text-2xl
                                    font-bold
                                    truncate
                                ">
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                                {editingProduct && (
                                    <p className="
                                        text-xs
                                        text-gray-500
                                        mt-1
                                    ">
                                        ID: {editingProduct.id}
                                    </p>
                                )}

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={
                                    saving ||
                                    galleryActionLoading
                                }
                                className="
                                    shrink-0
                                    w-9 h-9
                                    sm:w-10 sm:h-10
                                    flex
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-lg
                                    text-gray-500
                                    hover:text-black
                                    hover:bg-gray-100
                                    disabled:opacity-50
                                "
                            >
                                ✕
                            </button>

                        </div>


                        {/* ================================================= */}
                        {/* FORM */}
                        {/* ================================================= */}

                        <form
                            onSubmit={handleSubmit}
                            className="
                                p-4
                                sm:p-5
                                md:p-6
                                space-y-5
                            "
                        >

                            {error && (
                                <div className="
                                    bg-red-50
                                    border
                                    border-red-200
                                    text-red-700
                                    rounded-lg
                                    p-4
                                ">

                                    <p className="font-semibold">
                                        Please fix the following:
                                    </p>

                                    <p className="
                                        text-sm
                                        mt-1
                                    ">
                                        {error}
                                    </p>

                                </div>
                            )}


                            {/* ================================================= */}
                            {/* BASIC PRODUCT INFORMATION */}
                            {/* ================================================= */}

                            <div className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                gap-4
                                sm:gap-5
                            ">


                                {/* Brand */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Brand
                                    </label>

                                    <select
                                        name="brand"
                                        value={form.brand}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                            bg-white
                                        "
                                    >

                                        <option value="">
                                            Select Brand
                                        </option>

                                        {brands.map(
                                            (brand) => (

                                                <option
                                                    key={brand.id}
                                                    value={brand.id}
                                                >
                                                    {brand.name}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* Category */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                            bg-white
                                        "
                                    >

                                        <option value="">
                                            Select Category
                                        </option>

                                        {categories.map(
                                            (category) => (

                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* Name */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Product Name
                                    </label>

                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                        "
                                        placeholder="Product name"
                                    />

                                </div>


                                {/* SKU */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        SKU
                                    </label>

                                    <input
                                        name="sku"
                                        value={form.sku}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                        "
                                        placeholder="SKU"
                                    />

                                </div>


                                {/* Price */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                        "
                                    />

                                </div>


                                {/* Discount */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Discount Price
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        name="discount_price"
                                        value={
                                            form.discount_price
                                        }
                                        onChange={handleChange}
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                        "
                                    />

                                </div>


                                {/* Stock */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        required
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                        "
                                    />

                                </div>


                                {/* Thumbnail */}

                                <div>

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Thumbnail
                                    </label>

                                    <input
                                        type="file"
                                        name="thumbnail"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                            text-sm
                                        "
                                    />


                                    {/* Existing thumbnail */}

                                    {editingProduct?.thumbnail && (
                                        <div className="
                                            mt-3
                                            flex
                                            items-center
                                            gap-3
                                        ">

                                            <img
                                                src={
                                                    editingProduct.thumbnail
                                                }
                                                alt={
                                                    editingProduct.name
                                                }
                                                className="
                                                    w-20 h-20
                                                    rounded-lg
                                                    object-cover
                                                    border
                                                "
                                            />

                                            <div>

                                                <p className="
                                                    text-xs
                                                    text-gray-500
                                                ">
                                                    Current thumbnail
                                                </p>

                                                {form.thumbnail && (
                                                    <p className="
                                                        text-xs
                                                        text-green-600
                                                        mt-1
                                                    ">
                                                        New image selected
                                                    </p>
                                                )}

                                            </div>

                                        </div>
                                    )}

                                </div>


                                {/* ================================================= */}
                                {/* GALLERY UPLOAD */}
                                {/* ================================================= */}

                                <div className="
                                    sm:col-span-2
                                    mt-2
                                ">

                                    <label className="
                                        block
                                        font-semibold
                                        mb-2
                                    ">
                                        Gallery Images
                                    </label>

                                    <input
                                        type="file"
                                        name="gallery"
                                        accept="image/*"
                                        multiple
                                        onChange={
                                            handleGalleryChange
                                        }
                                        className="
                                            w-full
                                            border
                                            rounded-lg
                                            px-4 py-3
                                            text-sm
                                        "
                                    />


                                    {/* New previews */}

                                    {galleryPreviews.length > 0 && (

                                        <div className="mt-4">

                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                                mb-3
                                            ">

                                                <p className="font-semibold">
                                                    New Images
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        galleryPreviews.forEach(
                                                            (
                                                                preview
                                                            ) =>
                                                                URL.revokeObjectURL(
                                                                    preview.url
                                                                )
                                                        );

                                                        setGalleryFiles(
                                                            []
                                                        );

                                                        setGalleryPreviews(
                                                            []
                                                        );
                                                    }}
                                                    disabled={saving}
                                                    className="
                                                        text-sm
                                                        text-red-600
                                                        hover:text-red-700
                                                    "
                                                >
                                                    Clear
                                                </button>

                                            </div>


                                            <div className="
                                                grid
                                                grid-cols-2
                                                sm:grid-cols-3
                                                md:grid-cols-4
                                                gap-3
                                                sm:gap-4
                                            ">

                                                {galleryPreviews.map(
                                                    (
                                                        preview,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={`${preview.file.name}-${index}`}
                                                            className="
                                                                border
                                                                rounded-lg
                                                                overflow-hidden
                                                                bg-white
                                                            "
                                                        >

                                                            <img
                                                                src={
                                                                    preview.url
                                                                }
                                                                alt={`Preview ${index + 1
                                                                    }`}
                                                                className="
                                                                    w-full
                                                                    h-32
                                                                    sm:h-36
                                                                    object-cover
                                                                "
                                                            />

                                                            <p className="
                                                                text-xs
                                                                text-gray-500
                                                                p-2
                                                                truncate
                                                            ">
                                                                {
                                                                    preview.file
                                                                        .name
                                                                }
                                                            </p>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )}

                                </div>


                                {/* ================================================= */}
                                {/* EXISTING GALLERY */}
                                {/* ================================================= */}

                                <div className="
                                    sm:col-span-2
                                    mt-2
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        justify-between
                                        mb-3
                                    ">

                                        <p className="font-semibold">
                                            Existing Gallery Images
                                        </p>

                                        {galleryLoading && (
                                            <span className="
                                                text-sm
                                                text-gray-500
                                            ">
                                                Loading...
                                            </span>
                                        )}

                                    </div>


                                    {galleryLoading ? (

                                        <div className="
                                            border
                                            rounded-xl
                                            p-8
                                            text-center
                                            text-gray-500
                                        ">
                                            Loading gallery images...
                                        </div>

                                    ) : galleryImages.length === 0 ? (

                                        <div className="
                                            border
                                            border-dashed
                                            rounded-xl
                                            p-8
                                            text-center
                                            text-gray-400
                                        ">
                                            No gallery images.
                                        </div>

                                    ) : (

                                        <div className="
                                            grid
                                            grid-cols-2
                                            sm:grid-cols-3
                                            md:grid-cols-4
                                            gap-3
                                            sm:gap-4
                                        ">

                                            {galleryImages.map(
                                                (image) => (

                                                    <div
                                                        key={
                                                            image.id
                                                        }
                                                        className="
                                                            border
                                                            rounded-lg
                                                            overflow-hidden
                                                            bg-white
                                                            shadow-sm
                                                        "
                                                    >

                                                        <img
                                                            src={
                                                                image.image
                                                            }
                                                            alt={
                                                                image.alt_text ||
                                                                "Gallery image"
                                                            }
                                                            className="
                                                                w-full
                                                                h-32
                                                                object-cover
                                                            "
                                                        />


                                                        <div className="p-3">

                                                            <p className="
                                                                text-xs
                                                                text-gray-500
                                                                truncate
                                                            ">
                                                                {
                                                                    image.alt_text ||
                                                                    "No alt text"
                                                                }
                                                            </p>


                                                            <div className="
                                                                flex
                                                                flex-col
                                                                gap-2
                                                                mt-3
                                                            ">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEditGalleryImage(
                                                                            image
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        galleryActionLoading
                                                                    }
                                                                    className="
                                                                        w-full
                                                                        bg-blue-600
                                                                        hover:bg-blue-700
                                                                        disabled:bg-blue-300
                                                                        text-white
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-medium
                                                                    "
                                                                >
                                                                    Edit
                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteGalleryImage(
                                                                            image.id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        galleryActionLoading
                                                                    }
                                                                    className="
                                                                        w-full
                                                                        bg-red-600
                                                                        hover:bg-red-700
                                                                        disabled:bg-red-300
                                                                        text-white
                                                                        py-2
                                                                        rounded-lg
                                                                        text-sm
                                                                        font-medium
                                                                    "
                                                                >
                                                                    {galleryActionLoading
                                                                        ? "Processing..."
                                                                        : "Delete"}
                                                                </button>

                                                            </div>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}


                                    {/* ================================================= */}
                                    {/* EDIT GALLERY */}
                                    {/* ================================================= */}

                                    {editingGalleryImage && (

                                        <div className="
                                            mt-6
                                            p-4
                                            border
                                            rounded-xl
                                            bg-gray-50
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                                mb-4
                                            ">

                                                <h3 className="
                                                    font-semibold
                                                    text-lg
                                                ">
                                                    Edit Gallery Image
                                                </h3>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        cancelGalleryEdit
                                                    }
                                                    disabled={
                                                        galleryActionLoading
                                                    }
                                                    className="
                                                        text-gray-500
                                                        hover:text-black
                                                    "
                                                >
                                                    ✕
                                                </button>

                                            </div>


                                            {/* Image preview */}

                                            <div className="
                                                mb-4
                                                flex
                                                justify-center
                                            ">

                                                <img
                                                    src={
                                                        editingGalleryImage.image
                                                    }
                                                    alt={
                                                        editingGalleryImage.alt_text ||
                                                        "Gallery image"
                                                    }
                                                    className="
                                                        w-40
                                                        h-40
                                                        rounded-xl
                                                        object-cover
                                                        border
                                                    "
                                                />

                                            </div>


                                            {/* Alt text */}

                                            <div className="mb-4">

                                                <label className="
                                                    block
                                                    font-semibold
                                                    mb-2
                                                ">
                                                    Alt Text
                                                </label>

                                                <input
                                                    type="text"
                                                    value={
                                                        galleryAltText
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setGalleryAltText(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Enter image description"
                                                    className="
                                                        w-full
                                                        border
                                                        rounded-lg
                                                        px-4 py-3
                                                    "
                                                />

                                            </div>


                                            {/* Replace image */}

                                            <div className="mb-4">

                                                <label className="
                                                    block
                                                    font-semibold
                                                    mb-2
                                                ">
                                                    Replace Image
                                                </label>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setGalleryNewFile(
                                                            e.target
                                                                .files?.[0] ||
                                                            null
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                        border
                                                        rounded-lg
                                                        px-4 py-3
                                                        text-sm
                                                    "
                                                />

                                                {galleryNewFile && (
                                                    <p className="
                                                        text-sm
                                                        text-green-600
                                                        mt-2
                                                    ">
                                                        Selected:{" "}
                                                        {
                                                            galleryNewFile.name
                                                        }
                                                    </p>
                                                )}

                                            </div>


                                            {/* Buttons */}

                                            <div className="
                                                flex
                                                flex-col-reverse
                                                sm:flex-row
                                                gap-3
                                            ">

                                                <button
                                                    type="button"
                                                    onClick={
                                                        cancelGalleryEdit
                                                    }
                                                    disabled={
                                                        galleryActionLoading
                                                    }
                                                    className="
                                                        flex-1
                                                        border
                                                        rounded-lg
                                                        py-3
                                                        hover:bg-gray-100
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleUpdateGalleryImage
                                                    }
                                                    disabled={
                                                        galleryActionLoading
                                                    }
                                                    className="
                                                        flex-1
                                                        bg-black
                                                        hover:bg-gray-800
                                                        disabled:bg-gray-400
                                                        text-white
                                                        py-3
                                                        rounded-lg
                                                        font-medium
                                                    "
                                                >
                                                    {galleryActionLoading
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* SHORT DESCRIPTION */}
                            {/* ================================================= */}

                            <div>

                                <label className="
                                    block
                                    font-semibold
                                    mb-2
                                ">
                                    Short Description
                                </label>

                                <input
                                    name="short_description"
                                    value={
                                        form.short_description
                                    }
                                    onChange={handleChange}
                                    required
                                    maxLength={300}
                                    className="
                                        w-full
                                        border
                                        rounded-lg
                                        px-4 py-3
                                    "
                                    placeholder="Short product description"
                                />

                                <div className="
                                    text-xs
                                    text-gray-400
                                    text-right
                                    mt-1
                                ">
                                    {
                                        form.short_description
                                            .length
                                    }
                                    /300
                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* DESCRIPTION */}
                            {/* ================================================= */}

                            <div>

                                <label className="
                                    block
                                    font-semibold
                                    mb-2
                                ">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    className="
                                        w-full
                                        border
                                        rounded-lg
                                        px-4 py-3
                                        resize-y
                                    "
                                    placeholder="Full product description"
                                />

                            </div>


                            {/* ================================================= */}
                            {/* CHECKBOXES */}
                            {/* ================================================= */}

                            <div className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                lg:grid-cols-3
                                gap-3
                                sm:gap-4
                            ">


                                {/* Featured */}

                                <label className="
                                    flex
                                    items-center
                                    gap-3
                                    border
                                    rounded-lg
                                    p-4
                                    cursor-pointer
                                    hover:bg-gray-50
                                ">

                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        checked={
                                            form.is_featured
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                                            w-5 h-5
                                        "
                                    />

                                    <span className="font-semibold">
                                        ⭐ Featured
                                    </span>

                                </label>


                                {/* Active */}

                                <label className="
                                    flex
                                    items-center
                                    gap-3
                                    border
                                    rounded-lg
                                    p-4
                                    cursor-pointer
                                    hover:bg-gray-50
                                ">

                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={
                                            form.is_active
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                                            w-5 h-5
                                        "
                                    />

                                    <span className="font-semibold">
                                        🟢 Active
                                    </span>

                                </label>


                                {/* Flash Sale */}

                                <label className="
                                    flex
                                    items-center
                                    gap-3
                                    border
                                    rounded-lg
                                    p-4
                                    cursor-pointer
                                    hover:bg-gray-50
                                ">

                                    <input
                                        type="checkbox"
                                        name="is_flash_sale"
                                        checked={
                                            form.is_flash_sale
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                                            w-5 h-5
                                        "
                                    />

                                    <span className="font-semibold">
                                        ⚡ Flash Sale
                                    </span>

                                </label>

                            </div>


                            {/* ================================================= */}
                            {/* FORM BUTTONS */}
                            {/* ================================================= */}

                            <div className="
                                flex
                                flex-col-reverse
                                sm:flex-row
                                justify-end
                                gap-3
                                pt-4
                                border-t
                            ">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={
                                        saving ||
                                        galleryActionLoading
                                    }
                                    className="
                                        w-full
                                        sm:w-auto
                                        px-5 py-3
                                        border
                                        rounded-lg
                                        hover:bg-gray-100
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        galleryActionLoading
                                    }
                                    className="
                                        w-full
                                        sm:w-auto
                                        bg-black
                                        hover:bg-gray-800
                                        disabled:bg-gray-400
                                        text-white
                                        px-6 py-3
                                        rounded-lg
                                        font-semibold
                                    "
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingProduct
                                            ? "Update Product"
                                            : "Create Product"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}


// =============================================================
// API ERROR HELPER
// =============================================================

function extractApiError(
    err,
    fallback = "Something went wrong."
) {
    const data =
        err?.response?.data;

    if (!data) {
        return (
            err?.message ||
            fallback
        );
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.detail) {
        return String(data.detail);
    }

    if (data.error) {
        return String(data.error);
    }

    if (data.message) {
        return String(data.message);
    }

    if (data.errors) {
        return formatFieldErrors(
            data.errors
        );
    }

    if (
        typeof data === "object" &&
        Object.keys(data).length > 0
    ) {
        return formatFieldErrors(
            data
        );
    }

    return fallback;
}


// =============================================================
// FORMAT FIELD ERRORS
// =============================================================

function formatFieldErrors(errors) {
    return Object.entries(errors)
        .map(
            ([field, messages]) => {
                const message =
                    Array.isArray(messages)
                        ? messages.join(", ")
                        : typeof messages === "object"
                            ? JSON.stringify(messages)
                            : String(messages);

                return `${field}: ${message}`;
            }
        )
        .join(" | ");
}