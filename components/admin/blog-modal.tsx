"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface BlogPost {
    id: string
    title: string
    category: string
    content: string
    excerpt?: string | null
    image?: string | null
    published: boolean
    createdAt: string
    updatedAt: string
}

interface BlogModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (blog: any) => void
    categories: string[]
    title: string
    blog?: BlogPost | null
}

export default function BlogModal({ isOpen, onClose, onSubmit, categories, title, blog }: BlogModalProps) {
    const editorRef = useRef<any>(null)
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        content: "",
        excerpt: "",
        image: "",
        published: false,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Cập nhật form data khi blog được truyền vào
    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title,
                category: blog.category,
                content: blog.content,
                excerpt: blog.excerpt || "",
                image: blog.image || "",
                published: blog.published,
            })
        } else {
            // Reset form khi thêm mới
            setFormData({
                title: "",
                category: "",
                content: "",
                excerpt: "",
                image: "",
                published: false,
            })
        }
    }, [blog, isOpen])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Xóa lỗi khi người dùng nhập lại
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }


    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Xóa lỗi khi người dùng chọn lại
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    // Xử lý thay đổi switch
    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, published: checked }))
    }

    // Xử lý submit form
    const handleSubmit = () => {
        // Validate form
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = "Tiêu đề không được để trống"
        }

        if (!formData.category) {
            newErrors.category = "Vui lòng chọn danh mục"
        }

        const content = editorRef.current?.getContent() || ""
        if (!content.trim()) {
            newErrors.content = "Nội dung không được để trống"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Submit form
        const submittedData = {
            ...formData,
            content: content,
            ...(blog ? { id: blog.id, createdAt: blog.createdAt, updatedAt: new Date().toISOString() } : {}),
        }

        onSubmit(submittedData)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Tiêu đề <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Nhập tiêu đề bài viết"
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">
                                Danh mục <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Tóm tắt</Label>
                        <Textarea
                            id="excerpt"
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            placeholder="Nhập tóm tắt bài viết"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Ảnh đại diện</Label>
                        <Input
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="Nhập URL ảnh đại diện"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">
                            Nội dung <span className="text-red-500">*</span>
                        </Label>
                        <Editor
                            apiKey='6v3zh1gxbbr0x6qohpha4y10d5movactv2nqy9htzxjrajgh'
                            onInit={(_evt, editor) => (editorRef.current = editor)}
                            initialValue={formData.content || "<p>Nhập nội dung bài viết tại đây.</p>"}
                            init={{
                                height: 500,
                                menubar: false,
                                plugins: [
                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                ],
                                toolbar:
                                    "undo redo | blocks | " +
                                    "bold italic forecolor | alignleft aligncenter " +
                                    "alignright alignjustify | bullist numlist outdent indent | " +
                                    "removeformat | help",
                                content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                            }}
                        />
                        {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="published" checked={formData.published} onCheckedChange={handleSwitchChange} />
                        <Label htmlFor="published">Xuất bản ngay</Label>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit}>Lưu</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
