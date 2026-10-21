import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface DstechSubCategory {
  id: string;
  name: string;
  slug: string;
  entityType?: "PT" | "NON_PT";
}

export interface DstechCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  entityType?: "PT" | "NON_PT";
  subCategories: DstechSubCategory[];
}

const CATEGORIES_FILE = path.join(process.cwd(), "src", "data", "dstech_categories.json");
const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "dstech_products.json");

function readCategories(): DstechCategory[] {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading dstech_categories.json:", error);
    return [];
  }
}

function writeCategories(data: DstechCategory[]): boolean {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing dstech_categories.json:", error);
    return false;
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// GET: Ambil kategori & subkategori (mendukung filter query ?entity=PT atau ?entity=NON_PT)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity"); // 'PT' | 'NON_PT' | null

    let categories = readCategories();

    // Filter berdasarkan entitas jika diminta
    if (entity === "PT") {
      categories = categories.filter((c) => (c.entityType || "PT") === "PT");
    } else if (entity === "NON_PT") {
      categories = categories.filter((c) => c.entityType === "NON_PT");
    }
    
    // Hitung jumlah produk per kategori jika file produk tersedia
    let productCounts: Record<string, number> = {};
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        const prodRaw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const prods = JSON.parse(prodRaw);
        if (Array.isArray(prods)) {
          prods.forEach((p: { category?: string; entityType?: string }) => {
            if (p.category) {
              const catKey = p.category.toLowerCase().trim();
              // Jika ada filter entity, hitung produk yang cocok entitasnya
              if (entity && (p.entityType || "PT") !== entity) {
                return;
              }
              productCounts[catKey] = (productCounts[catKey] || 0) + 1;
            }
          });
        }
      } catch (err) {
        console.warn("Could not calculate product counts:", err);
      }
    }

    const categoriesWithCount = categories.map((cat) => {
      const matchKey = cat.name.toLowerCase().trim();
      const count = productCounts[matchKey] || 0;
      return {
        ...cat,
        entityType: cat.entityType || "PT",
        productCount: count,
      };
    });

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
      total: categories.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat kategori DSTech", error: String(error) },
      { status: 500 }
    );
  }
}

// POST: Tambah Kategori Baru ATAU Sub-Kategori Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const categories = readCategories();

    // Skenario 1: Tambah Sub-Kategori ke Kategori Tertentu
    if (body.type === "SUBCATEGORY" || body.categoryId) {
      const categoryId = body.categoryId || body.parentCategoryId;
      const subName = body.name?.trim();

      if (!categoryId || !subName) {
        return NextResponse.json(
          { success: false, message: "Category ID dan Nama Sub-Kategori wajib diisi" },
          { status: 400 }
        );
      }

      const targetCatIndex = categories.findIndex((c) => c.id === categoryId);
      if (targetCatIndex === -1) {
        return NextResponse.json(
          { success: false, message: "Kategori induk tidak ditemukan" },
          { status: 404 }
        );
      }

      const newSubCategory: DstechSubCategory = {
        id: `dstech_subcat_${Date.now()}`,
        name: subName,
        slug: slugify(subName),
        entityType: body.entityType || categories[targetCatIndex].entityType || "PT",
      };

      if (!Array.isArray(categories[targetCatIndex].subCategories)) {
        categories[targetCatIndex].subCategories = [];
      }

      categories[targetCatIndex].subCategories.push(newSubCategory);
      writeCategories(categories);

      return NextResponse.json({
        success: true,
        message: "Sub-kategori berhasil ditambahkan",
        data: newSubCategory,
        category: categories[targetCatIndex],
      });
    }

    // Skenario 2: Tambah Kategori Utama Baru
    const catName = body.name?.trim();
    if (!catName) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Cek duplikasi
    const exists = categories.some((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }

    const newCategory: DstechCategory = {
      id: `dstech_cat_${Date.now()}`,
      name: catName,
      slug: slugify(catName),
      icon: body.icon?.trim() || "FolderTree",
      description: body.description?.trim() || "",
      entityType: body.entityType === "NON_PT" ? "NON_PT" : "PT",
      subCategories: Array.isArray(body.subCategories) ? body.subCategories : [],
    };

    categories.push(newCategory);
    writeCategories(categories);

    return NextResponse.json({
      success: true,
      message: "Kategori baru berhasil dibuat",
      data: newCategory,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan kategori", error: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Perbarui Kategori ATAU Sub-Kategori
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const categories = readCategories();

    // Skenario 1: Edit Sub-Kategori
    if (body.type === "SUBCATEGORY" || (body.categoryId && body.subCategoryId)) {
      const { categoryId, subCategoryId, name } = body;
      const targetCat = categories.find((c) => c.id === categoryId);
      if (!targetCat) {
        return NextResponse.json(
          { success: false, message: "Kategori induk tidak ditemukan" },
          { status: 404 }
        );
      }

      const targetSub = targetCat.subCategories?.find((s) => s.id === subCategoryId);
      if (!targetSub) {
        return NextResponse.json(
          { success: false, message: "Sub-kategori tidak ditemukan" },
          { status: 404 }
        );
      }

      if (name) {
        targetSub.name = name.trim();
        targetSub.slug = slugify(name);
      }

      writeCategories(categories);
      return NextResponse.json({
        success: true,
        message: "Sub-kategori berhasil diperbarui",
        data: targetSub,
      });
    }

    // Skenario 2: Edit Kategori Utama
    const { id, name, icon, description, entityType } = body;
    const targetIndex = categories.findIndex((c) => c.id === id);
    if (targetIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    if (name) {
      categories[targetIndex].name = name.trim();
      categories[targetIndex].slug = slugify(name);
    }
    if (icon !== undefined) categories[targetIndex].icon = icon;
    if (description !== undefined) categories[targetIndex].description = description.trim();
    if (entityType === "PT" || entityType === "NON_PT") categories[targetIndex].entityType = entityType;

    writeCategories(categories);
    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: categories[targetIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui kategori", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Kategori ATAU Sub-Kategori
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || searchParams.get("id");
    const subCategoryId = searchParams.get("subCategoryId");
    const type = searchParams.get("type");

    const categories = readCategories();

    // Skenario 1: Hapus Sub-Kategori
    if (type === "SUBCATEGORY" || (categoryId && subCategoryId)) {
      const targetCatIndex = categories.findIndex((c) => c.id === categoryId);
      if (targetCatIndex === -1) {
        return NextResponse.json(
          { success: false, message: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }

      const initialCount = categories[targetCatIndex].subCategories.length;
      categories[targetCatIndex].subCategories = categories[targetCatIndex].subCategories.filter(
        (s) => s.id !== subCategoryId
      );

      if (categories[targetCatIndex].subCategories.length === initialCount) {
        return NextResponse.json(
          { success: false, message: "Sub-kategori tidak ditemukan" },
          { status: 404 }
        );
      }

      writeCategories(categories);
      return NextResponse.json({
        success: true,
        message: "Sub-kategori berhasil dihapus",
      });
    }

    // Skenario 2: Hapus Kategori Utama
    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "ID Kategori diperlukan" },
        { status: 400 }
      );
    }

    const filtered = categories.filter((c) => c.id !== categoryId);
    if (filtered.length === categories.length) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    writeCategories(filtered);
    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal menghapus kategori", error: String(error) },
      { status: 500 }
    );
  }
}
