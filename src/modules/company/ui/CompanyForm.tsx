"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";
import { Button } from "@/shared/components/Button";
import { FileUpload } from "@/shared/components/FileUpload";
import { Card } from "@/shared/components/Card";
import type {
  Company,
  CompanySize,
  UpdateCompanyRequest,
} from "../domain/company.types";

interface CompanyFormProps {
  company: Company;
  saving: boolean;
  onSave: (data: UpdateCompanyRequest) => void;
  onUploadLogo: (file: File) => void;
  onCancel?: () => void;
}

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: "micro", label: "Microempresa" },
  { value: "small", label: "Pequeña" },
  { value: "medium", label: "Mediana" },
  { value: "large", label: "Grande" },
  { value: "enterprise", label: "Corporativa" },
];

const WIZARD_STEPS = [
  { title: "Logo", subtitle: "Imagen corporativa" },
  { title: "Informacion", subtitle: "Datos generales" },
  { title: "Perfil", subtitle: "Tamano y estructura" },
] as const;

function parsePositiveInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function parseYear(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) return null;
  return parsed;
}

export function CompanyForm({
  company,
  saving,
  onSave,
  onUploadLogo,
  onCancel,
}: CompanyFormProps) {
  const [name, setName] = useState(company.name);
  const [description, setDescription] = useState(company.description);
  const [nit, setNit] = useState(company.nit);
  const [address, setAddress] = useState(company.address);
  const [phone, setPhone] = useState(company.phone);
  const [email, setEmail] = useState(company.email);
  const [industry, setIndustry] = useState(company.industry);
  const [city, setCity] = useState(company.city);
  const [website, setWebsite] = useState(company.website);
  const [legalRepresentative, setLegalRepresentative] = useState(
    company.legalRepresentative,
  );
  const [companySize, setCompanySize] = useState<CompanySize>(
    company.companySize,
  );
  const [branchCount, setBranchCount] = useState(
    company.branchCount.toString(),
  );
  const [employeeCount, setEmployeeCount] = useState(
    company.employeeCount.toString(),
  );
  const [foundedYear, setFoundedYear] = useState(
    company.foundedYear ? company.foundedYear.toString() : "",
  );
  const [currentStep, setCurrentStep] = useState(0);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  function handleSave() {
    if (saving) return;
    onSave({
      name,
      description,
      nit,
      address,
      phone,
      email,
      industry,
      city,
      website,
      legalRepresentative,
      companySize,
      branchCount: parsePositiveInt(branchCount),
      employeeCount: parsePositiveInt(employeeCount),
      foundedYear: parseYear(foundedYear),
    });
  }

  function handleLogoSelect(file: File | null) {
    if (file) onUploadLogo(file);
  }

  function goToPreviousStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  function goToNextStep() {
    setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='mx-auto w-full max-w-4xl space-y-6'
    >
      <Card>
        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Configuracion de Empresa
          </h2>
          <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>
            Paso {currentStep + 1} de {WIZARD_STEPS.length}
          </span>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          {WIZARD_STEPS.map((step, index) => {
            const active = currentStep === index;
            const completed = currentStep > index;
            return (
              <button
                key={step.title}
                type='button'
                onClick={() => setCurrentStep(index)}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : completed
                      ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    active
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {step.title}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {step.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {currentStep === 0 && (
        <Card>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Logo de la Empresa
          </h3>
          <div className='mx-auto w-full max-w-md'>
            <FileUpload
              className='w-full items-center'
              label='Logo'
              accept='image/png,image/jpeg,image/webp,image/svg+xml'
              onFileSelect={handleLogoSelect}
              preview={company.logoUrl || null}
            />
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Informacion General
          </h3>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Input
                label='Nombre de la Empresa'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Mi Empresa S.A.S.'
                required
              />
              <Input
                label='NIT'
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder='900.123.456-7'
              />
            </div>

            <Textarea
              label='Descripcion'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe tu negocio...'
              rows={3}
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Input
                label='Direccion'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='Calle 123 #45-67, Bogota'
              />
              <Input
                label='Telefono'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='+57 300 123 4567'
              />
            </div>

            <Input
              label='Email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='contacto@miempresa.com'
            />

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Input
                label='Sector Economico'
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder='Tecnologia, Retail, Manufactura...'
              />
              <Input
                label='Ciudad Principal'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder='Bogota'
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <Input
                label='Sitio Web'
                type='url'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder='https://miempresa.com'
              />
              <Input
                label='Representante Legal'
                value={legalRepresentative}
                onChange={(e) => setLegalRepresentative(e.target.value)}
                placeholder='Nombre del representante'
              />
            </div>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-white'>
            Perfil de la Empresa
          </h3>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Select
              label='Tamano de Empresa'
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value as CompanySize)}
              options={SIZE_OPTIONS}
              placeholder='Selecciona una opcion'
            />
            <Input
              label='Ano de Fundacion'
              type='number'
              min={1900}
              max={2100}
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder='2020'
            />
            <Input
              label='Cantidad de Sucursales'
              type='number'
              min={0}
              value={branchCount}
              onChange={(e) => setBranchCount(e.target.value)}
              placeholder='0'
            />
            <Input
              label='Cantidad de Empleados'
              type='number'
              min={0}
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              placeholder='0'
            />
          </div>
        </Card>
      )}

      <div className='flex items-center justify-between'>
        {isFirstStep ? (
          onCancel ? (
            <Button type='button' variant='ghost' onClick={onCancel}>
              Cancelar
            </Button>
          ) : (
            <div />
          )
        ) : (
          <Button type='button' variant='outline' onClick={goToPreviousStep}>
            Anterior
          </Button>
        )}

        {!isLastStep ? (
          <Button type='button' onClick={goToNextStep}>
            Siguiente
          </Button>
        ) : (
          <Button type='button' onClick={handleSave} loading={saving}>
            Guardar Cambios
          </Button>
        )}
      </div>
    </form>
  );
}
