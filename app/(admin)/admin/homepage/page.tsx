import { HomepageHeroForm } from "@/components/admin/homepage-hero-form"
import { getHomepageHeroContentForAdmin } from "@/lib/homepage-content"

export default async function AdminHomepageContentPage() {
  const content = await getHomepageHeroContentForAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-hero font-bold mb-2">مدیریت متن هیرو صفحه نخست</h1>
        <p className="text-body text-muted-foreground">
          متن اصلی و زیرتیتر صفحه نخست را برای ویترین فروشگاه به‌روزرسانی کنید.
        </p>
      </div>
      <HomepageHeroForm initialContent={content} />
    </div>
  )
}
