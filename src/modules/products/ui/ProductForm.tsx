"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Trash2, ImagePlus, X } from "lucide-react";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Modal } from "@/shared/components/Modal";
import { Select } from "@/shared/components/Select";
import {
  SearchableSelect,
  type SearchableOption,
} from "@/shared/components/SearchableSelect";
import { useSessionPermissions } from "@/shared/hooks/useSessionPermissions";
import { ProductsService } from "../application/products.service";
import { ProductsJsonAdapter } from "../infrastructure/products-json.adapter";
import { getAllBranchesAction } from "@/modules/branches/infrastructure/branches.actions";
import type { Branch } from "@/modules/branches/domain/branches.types";
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from "../domain/products.types";

function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("es-CO");
}

function unformatThousands(value: string): string {
  return value.replace(/\D/g, "");
}

const adapter = new ProductsJsonAdapter();
const service = new ProductsService(adapter);

const UNIT_MEASURES = [
  "Unidad",
  "Kilogramo",
  "Gramo",
  "Litro",
  "Metro",
  "Metro cuadrado",
  "Metro cubico",
  "Hora",
  "Dia",
  "Servicio",
  "Paquete",
  "Caja",
  "Docena",
];

interface ProductFormProps {
  productId?: string;
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectiveBranchId } = useSessionPermissions();
  const isEdit = !!productId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  // Form fields
  const [branchId, setBranchId] = useState(
    effectiveBranchId || searchParams.get("branchId") || "",
  );
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState("19");
  const [discount, setDiscount] = useState("0");
  const [discountRate, setDiscountRate] = useState("0");
  const [stock, setStock] = useState("");
  const [unitMeasure, setUnitMeasure] = useState("Unidad");
  const [isActive, setIsActive] = useState(true);

  // Image: file to upload + preview URL (CDN path or blob URL)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branches for select
  const [branchOptions, setBranchOptions] = useState<SearchableOption[]>([]);

  useEffect(() => {
    getAllBranchesAction().then((branches: Branch[]) => {
      setBranchOptions(
        branches.map((b) => ({
          value: b.id,
          label: b.name,
          sublabel: b.city,
        })),
      );
    });
  }, []);

  useEffect(() => {
    if (!productId) return;
    service.getById(productId).then((product) => {
      if (product) {
        setBranchId(product.branchId);
        setCode(product.code);
        setName(product.name);
        setDescription(product.description);
        setPrice(String(product.price));
        setTaxRate(String(product.taxRate));
        setDiscount(String(product.discount));
        setDiscountRate(String(product.discountRate));
        setStock(String(product.stock));
        setUnitMeasure(product.unitMeasure);
        setImagePreview(product.image || "");
        setIsActive(product.isActive);
      }
      setLoading(false);
    });
  }, [productId]);

  const handleFileSelect = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleImageClear = useCallback(() => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError(null);

      if (!branchId) {
        setError("Debes seleccionar una sucursal");
        setSaving(false);
        return;
      }

      try {
        let targetProductId = productId;

        if (isEdit && productId) {
          const data: UpdateProductRequest = {
            branchId,
            code,
            name,
            description,
            price: parseFloat(price) || 0,
            taxRate: parseFloat(taxRate) || 0,
            discount: parseFloat(discount) || 0,
            discountRate: parseFloat(discountRate) || 0,
            stock: parseInt(stock) || 0,
            unitMeasure,
            isActive,
          };
          const result = await service.update(productId, data);
          if (!result.success) {
            setError(result.error || "Error al actualizar");
            return;
          }
        } else {
          const data: CreateProductRequest = {
            branchId,
            code,
            name,
            description,
            price: parseFloat(price) || 0,
            taxRate: parseFloat(taxRate) || 0,
            discount: parseFloat(discount) || 0,
            discountRate: parseFloat(discountRate) || 0,
            stock: parseInt(stock) || 0,
            unitMeasure,
          };
          const result = await service.create(data);
          if (!result.success) {
            setError(result.error || "Error al crear");
            return;
          }
          targetProductId = result.data?.id;
        }

        // Upload image if a new file was selected
        if (imageFile && targetProductId) {
          const formData = new FormData();
          formData.append("image", imageFile);
          const imgResult = await service.uploadImage(
            targetProductId,
            formData,
          );
          if (!imgResult.success) {
            setError(imgResult.error || "Error al subir imagen");
            return;
          }
        }

        router.push("/dashboard/productos");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setSaving(false);
      }
    },
    [
      isEdit,
      productId,
      branchId,
      code,
      name,
      description,
      imageFile,
      price,
      taxRate,
      discount,
      discountRate,
      stock,
      unitMeasure,
      isActive,
      router,
    ],
  );

  const handleDelete = useCallback(async () => {
    if (!productId) return;
    setSaving(true);
    const result = await service.remove(productId);
    if (result.success) {
      router.push("/dashboard/productos");
    } else {
      setError(result.error || "Error al eliminar");
      setSaving(false);
    }
  }, [productId, router]);

  if (loading) {
    return (
      <p className='mx-auto max-w-2xl py-12 text-center text-gray-400 dark:text-gray-500'>
        Cargando...
      </p>
    );
  }

  return (
    <>
      <div className='mx-auto w-full max-w-3xl'>
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='mb-4 gap-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
        >
          <ArrowLeft className='h-4 w-4' />
          Volver
        </Button>
      </div>
      <form
        onSubmit={handleSubmit}
        className='mx-auto w-full max-w-3xl space-y-6'
      >
        {error && (
          <div className='rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400'>
            {error}
          </div>
        )}

        <Card>
          <div className='mb-5'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {isEdit ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Registra la informacion del producto para el inventario de la
              sucursal.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <SearchableSelect
              label='Sucursal'
              options={branchOptions}
              value={branchId}
              onChange={(val) => setBranchId(val)}
              placeholder='Seleccionar sucursal...'
              required
              disabled={!!effectiveBranchId}
            />
            <Input
              label='Codigo'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder='SKU001'
              required
            />
            <Input
              label='Nombre del Producto'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Servicio Web'
              required
            />
            <Select
              label='Unidad de Medida'
              value={unitMeasure}
              onChange={(e) => setUnitMeasure(e.target.value)}
              options={UNIT_MEASURES.map((u) => ({ value: u, label: u }))}
            />
            <div className='sm:col-span-2'>
              <Input
                label='Descripcion'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Descripcion del producto o servicio'
              />
            </div>
            <div className='sm:col-span-2'>
              <label className='mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300'>
                Imagen del Producto
              </label>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  handleFileSelect(file);
                }}
              />
              {imagePreview ? (
                <div className='relative inline-block'>
                  <Image
                    src={imagePreview}
                    alt='Preview'
                    width={128}
                    height={128}
                    className='h-32 w-32 rounded-lg border border-gray-200 dark:border-gray-700 object-cover'
                  />
                  <button
                    type='button'
                    onClick={handleImageClear}
                    className='absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400'
                >
                  <ImagePlus className='h-6 w-6' />
                  <span className='text-xs'>Subir imagen</span>
                </button>
              )}
              <p className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
                JPG, PNG o WebP.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className='mb-5'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Precios e Impuestos
            </h2>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <Input
              label='Precio Unitario (COP)'
              value={formatThousands(price)}
              onChange={(e) => setPrice(unformatThousands(e.target.value))}
              placeholder='500.000'
              required
            />
            <Input
              label='IVA (%)'
              type='number'
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder='19'
            />
            <Input
              label='Stock'
              type='number'
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder='100'
              required
            />
            <Input
              label='Descuento (COP)'
              value={formatThousands(discount)}
              onChange={(e) => setDiscount(unformatThousands(e.target.value))}
              placeholder='0'
            />
            <Input
              label='Tasa Descuento (%)'
              type='number'
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              placeholder='0'
            />
            {isEdit && (
              <div className='flex items-end'>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 w-full'>
                  <input
                    type='checkbox'
                    id='isActive'
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className='mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='isActive'
                    className='text-sm text-gray-700 dark:text-gray-300'
                  >
                    Producto activo
                  </label>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className='flex items-center justify-between'>
          {isEdit ? (
            <Button
              type='button'
              variant='ghost'
              className='text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className='h-4 w-4' />
              Eliminar
            </Button>
          ) : (
            <div />
          )}
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type='submit' loading={saving}>
              {isEdit ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </div>
      </form>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title='Eliminar Producto'
        size='sm'
      >
        <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
          Esta accion no se puede deshacer. El producto sera eliminado
          permanentemente.
        </p>
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={() => setShowDelete(false)}>
            Cancelar
          </Button>
          <Button
            className='bg-red-600 hover:bg-red-700'
            loading={saving}
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
