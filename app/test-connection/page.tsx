"use client"
import { sdk } from "../lib/sdk"
import { useEffect, useState } from "react"

export default function TestConnection() {
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { products } = await sdk.store.product.list()
        setProducts(products)
      } catch (err: any) {
        let errorMessage = err.message || "An error occurred"
        if (errorMessage === "Failed to fetch") {
          errorMessage = "Failed to fetch. Ensure your Medusa backend is running and CORS is configured to allow this origin (e.g., http://localhost:3000)."
        }
        setError(errorMessage)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Medusa Connection Test</h1>

      <div className="mb-4">
        <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}</p>
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {products.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Products Found ({products.length}):</h2>
          <ul className="list-disc pl-5">
            {products.map((product) => (
              <li key={product.id} className="mb-2">
                <span className="font-medium">{product.title}</span> (ID: {product.id})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && !error && <p>No products found. (Connection might be successful but store is empty)</p>
      )}
    </div>
  )
}
