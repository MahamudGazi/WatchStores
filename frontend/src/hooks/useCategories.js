import { useEffect, useState } from "react";
import { getCategories } from "../services/categoryService";

export default function useCategories() {

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        let mounted = true;


        const fetchCategories = async () => {

            try {

                setLoading(true);
                setError("");


                const data = await getCategories();


                if (!mounted) return;


                // ==========================================
                // HANDLE DIFFERENT API RESPONSE FORMATS
                // ==========================================

                const categoryData =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                            ? data.results
                            : Array.isArray(data?.data)
                                ? data.data
                                : [];


                setCategories(categoryData);

            } catch (error) {

                console.error(
                    "Failed to load categories:",
                    error
                );


                if (!mounted) return;


                setCategories([]);

                setError(
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    "Failed to load categories."
                );

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        };


        fetchCategories();


        return () => {
            mounted = false;
        };

    }, []);


    return {
        categories,
        loading,
        error,
    };
}
