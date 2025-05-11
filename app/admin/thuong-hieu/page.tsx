"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Pencil, Trash2, Plus } from "lucide-react"

interface Brand {
    id: string
    name: string
    description: string | null
    logo: string | null
}

export default function BrandsPage() {
    const router = useRouter()
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        logo: ""
    })
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchBrands()
    }, [search])

    const fetchBrands = async () => {
        try {
            const params = new URLSearchParams()
            if (search) params.append("search", search)

            const response = await fetch(`/api/admin/brands?${params}`)
            if (!response.ok) {
                throw new Error("Failed to fetch brands")
            }

            const data = await response.json()
            setBrands(data)
        } catch (error) {
            setError("Failed to load brands")
            toast.error("Failed to load brands")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingBrand
                ? `/api/admin/brands/${editingBrand.id}`
                : "/api/admin/brands"
            const method = editingBrand ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                throw new Error("Failed to save brand")
            }

            toast.success(editingBrand ? "Brand updated" : "Brand created")
            setIsDialogOpen(false)
            setEditingBrand(null)
            setFormData({
                name: "",
                description: "",
                logo: ""
            })
            fetchBrands()
        } catch (error) {
            toast.error("Failed to save brand")
        }
    }

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand)
        setFormData({
            name: brand.name,
            description: brand.description || "",
            logo: brand.logo || ""
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this brand?")) return

        try {
            const response = await fetch(`/api/admin/brands/${id}`, {
                method: "DELETE"
            })

            if (!response.ok) {
                throw new Error("Failed to delete brand")
            }

            toast.success("Brand deleted")
            fetchBrands()
        } catch (error) {
            toast.error("Failed to delete brand")
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>{error}</div>

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Brands</h1>
                <div className="flex gap-4">
                    <Input
                        placeholder="Search brands..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => {
                                setEditingBrand(null)
                                setFormData({
                                    name: "",
                                    description: "",
                                    logo: ""
                                })
                            }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Brand
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingBrand ? "Edit Brand" : "Add Brand"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <Input
                                        id="logo"
                                        value={formData.logo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, logo: e.target.value })
                                        }
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingBrand ? "Update" : "Create"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Logo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brands.map((brand) => (
                            <TableRow key={brand.id}>
                                <TableCell>
                                    {brand.logo && (
                                        <img
                                            src={brand.logo}
                                            alt={brand.name}
                                            className="w-12 h-12 object-contain"
                                        />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{brand.name}</TableCell>
                                <TableCell>{brand.description}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(brand)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(brand.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
} 