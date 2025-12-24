"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit2, Trash2, X, Save } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    slug: "",
    description: "",
    image: "",
    order: 0,
    isActive: true,
  })
  const [editData, setEditData] = useState<any>(null)

  // Generate slug from Persian name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077F\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const filteredCategories = (categories || []).filter((category: any) => {
    const term = search.trim().toLowerCase()
    if (!term) return true
    return (
      category.name?.toLowerCase().includes(term) ||
      category.slug?.toLowerCase().includes(term)
    )
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "??? ?? ????? ?????????")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsCreating(false)
      setFormData({
        name: "",
        nameEn: "",
        slug: "",
        description: "",
        image: "",
        order: 0,
        isActive: true,
      })
      toast({
        title: "??????",
        description: "????????? ?? ?????? ????? ??.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "???",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "??? ?? ??????????? ?????????")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setEditingId(null)
      setEditData(null)
      toast({
        title: "??????",
        description: "????????? ?? ?????? ??????????? ??.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "???",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "??? ?? ??? ?????????")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast({
        title: "??????",
        description: "????????? ?? ?????? ??? ??.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "???",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleCreate = () => {
    if (!formData.name || !formData.slug) {
      toast({
        title: "???",
        description: "??? ? ????? ????????? ?????? ???.",
        variant: "destructive",
      })
      return
    }
    createMutation.mutate(formData)
  }

  const handleEdit = (category: any) => {
    setEditingId(category.id)
    setEditData({
      name: category.name,
      nameEn: category.nameEn || "",
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      order: category.order,
      isActive: category.isActive,
    })
  }

  const handleUpdate = (id: string) => {
    if (!editData?.name || !editData?.slug) {
      toast({
        title: "???",
        description: "??? ? ????? ????????? ?????? ???.",
        variant: "destructive",
      })
      return
    }
    updateMutation.mutate({ id, data: editData })
  }

  const handleDelete = (id: string) => {
    if (confirm("??? ?? ??? ????????? ??????? ?????? ??? ??? ???? ?????? ????.")) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">????????????</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            ?????? ???????????? ? ????? ???????
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="????? ?? ????????????"
            />
          </div>
          <Button
            className="btn-editorial w-full sm:w-auto"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus className="w-5 h-5 ml-2" />
            {isCreating ? "??????" : "?????? ?????????"}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="card-editorial">
          <CardHeader>
            <CardTitle>?????? ????????? ????</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">??? ????????? *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value),
                    })
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">????? *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">???????</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL ?????</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="btn-editorial"
              >
                {createMutation.isPending ? "?? ??? ?????..." : "?????"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                disabled={createMutation.isPending}
              >
                ??????
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card className="card-editorial">
        <CardHeader>
          <CardTitle>????? ????????????</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length > 0 ? (
            <div className="space-y-4">
              {filteredCategories.map((category: any) => (
                <div
                  key={category.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-border/40 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  {editingId === category.id ? (
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>??? ?????????</Label>
                          <Input
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>?????</Label>
                          <Input
                            value={editData.slug}
                            onChange={(e) =>
                              setEditData({ ...editData, slug: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(category.id)}
                          disabled={updateMutation.isPending}
                        >
                          <Save className="w-4 h-4 ml-2" />
                          ?????
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null)
                            setEditData(null)
                          }}
                        >
                          <X className="w-4 h-4 ml-2" />
                          ??????
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ?????: {category.slug} - {category._count?.products || 0} ?????
                        </div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {category.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="w-4 h-4 ml-2" />
                          ??????
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          ???
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              ??? ???????????? ??? ???? ???.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
