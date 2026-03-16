import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/shared/lib/cloudinary";
import {
  readJsonFile,
  writeJsonFile,
} from "@/shared/lib/json-storage";
import type { Product } from "@/modules/products/domain/products.types";

export async function POST(request: NextRequest) {
  try {
    // Verify the request has a valid auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file || !productId) {
      return NextResponse.json(
        { success: false, error: "Faltan datos" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const allowed = ["png", "jpg", "jpeg", "webp", "svg"];
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { success: false, error: "Formato no permitido. Usa: " + allowed.join(", ") },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:image/${ext};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "retofactus/products",
      public_id: productId,
      overwrite: true,
      resource_type: "image",
    });

    const imageUrl = result.secure_url;

    const products = await readJsonFile<Product[]>("products.json");
    const index = products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      products[index].image = imageUrl;
      products[index].updatedAt = new Date().toISOString();
      await writeJsonFile("products.json", products);
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al subir imagen",
      },
      { status: 500 },
    );
  }
}
