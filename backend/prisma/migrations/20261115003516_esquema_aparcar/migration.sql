/*
  Warnings:

  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contrasenaHash` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `hashContrasena` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadoAfiliacion" AS ENUM ('PENDIENTE_VINCULACION', 'ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "TipoCelda" AS ENUM ('CARRO', 'MOTO', 'MIXTA');

-- CreateEnum
CREATE TYPE "EstadoCelda" AS ENUM ('LIBRE', 'OCUPADA');

-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('CARRO', 'MOTO');

-- CreateEnum
CREATE TYPE "EstadoCodigoQr" AS ENUM ('ACTIVO', 'REVOCADO');

-- CreateEnum
CREATE TYPE "OrigenMovimiento" AS ENUM ('MANUAL', 'LECTOR_QR');

-- CreateEnum
CREATE TYPE "MedioPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'OTRO');

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "contrasenaHash",
ADD COLUMN     "bloqueadoHasta" TIMESTAMPTZ,
ADD COLUMN     "debeCambiarContrasena" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hashContrasena" TEXT NOT NULL,
ADD COLUMN     "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "telefono" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "rol" SET DEFAULT 'CLIENTE',
ALTER COLUMN "creadoEn" SET DATA TYPE TIMESTAMPTZ,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Personal" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consentimiento" (
    "id" UUID NOT NULL,
    "usuarioId" UUID NOT NULL,
    "versionPolitica" TEXT NOT NULL,
    "aceptadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consentimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Afiliacion" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "usuarioId" UUID,
    "estado" "EstadoAfiliacion" NOT NULL DEFAULT 'PENDIENTE_VINCULACION',
    "nombreTitular" TEXT NOT NULL,
    "telefonoTitular" TEXT NOT NULL,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Afiliacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "Parqueadero" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parqueadero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Celda" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipoPermitido" "TipoCelda" NOT NULL,
    "estado" "EstadoCelda" NOT NULL DEFAULT 'LIBRE',

    CONSTRAINT "Celda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarifa" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "tipoVehiculo" "TipoVehiculo" NOT NULL,
    "valorHora" DECIMAL(10,2) NOT NULL,
    "valorDia" DECIMAL(10,2) NOT NULL,
    "valorMensualidad" DECIMAL(10,2) NOT NULL,
    "vigenteDesde" TIMESTAMPTZ NOT NULL,
    "vigenteHasta" TIMESTAMPTZ,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo" "TipoVehiculo" NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VinculoVehiculo" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "afiliacionId" UUID NOT NULL,
    "vehiculoId" UUID NOT NULL,
    "fechaInicio" TIMESTAMPTZ NOT NULL,
    "fechaFin" TIMESTAMPTZ,

    CONSTRAINT "VinculoVehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoVinculacion" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "afiliacionId" UUID NOT NULL,
    "hashCodigo" TEXT NOT NULL,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "venceEn" TIMESTAMPTZ NOT NULL,
    "usadoEn" TIMESTAMPTZ,
    "invalidadoEn" TIMESTAMPTZ,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodigoVinculacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodigoQr" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "vehiculoId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "estado" "EstadoCodigoQr" NOT NULL DEFAULT 'ACTIVO',
    "emitidoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revocadoEn" TIMESTAMPTZ,

    CONSTRAINT "CodigoQr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "celdaId" UUID NOT NULL,
    "tarifaId" UUID NOT NULL,
    "vehiculoId" UUID,
    "registradoPorId" UUID NOT NULL,
    "dispositivoId" UUID,
    "placa" TEXT NOT NULL,
    "tipoVehiculo" "TipoVehiculo" NOT NULL,
    "codigoTiquete" TEXT,
    "origen" "OrigenMovimiento" NOT NULL,
    "entradaEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salidaEn" TIMESTAMPTZ,
    "valorCobrado" DECIMAL(10,2),
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "motivoAnulacion" TEXT,
    "anuladoEn" TIMESTAMPTZ,
    "anuladoPorId" UUID,
    "corrigeAId" UUID,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "afiliacionId" UUID NOT NULL,
    "tarifaId" UUID NOT NULL,
    "registradoPorId" UUID NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "medioPago" "MedioPago" NOT NULL,
    "fechaPago" TIMESTAMPTZ NOT NULL,
    "periodoDesde" TIMESTAMPTZ NOT NULL,
    "periodoHasta" TIMESTAMPTZ NOT NULL,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anulado" BOOLEAN NOT NULL DEFAULT false,
    "motivoAnulacion" TEXT,
    "anuladoEn" TIMESTAMPTZ,
    "anuladoPorId" UUID,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispositivo" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "hashClave" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Dispositivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" UUID NOT NULL,
    "parqueaderoId" UUID,
    "usuarioId" UUID,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "detalle" JSONB NOT NULL,
    "creadoEn" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Personal_usuarioId_key" ON "Personal"("usuarioId");

-- CreateIndex
CREATE INDEX "Personal_parqueaderoId_idx" ON "Personal"("parqueaderoId");

-- CreateIndex
CREATE INDEX "Afiliacion_parqueaderoId_idx" ON "Afiliacion"("parqueaderoId");

-- CreateIndex
CREATE INDEX "session_expire_idx" ON "session"("expire");

-- CreateIndex
CREATE UNIQUE INDEX "Celda_parqueaderoId_codigo_key" ON "Celda"("parqueaderoId", "codigo");

-- CreateIndex
CREATE INDEX "Tarifa_parqueaderoId_tipoVehiculo_idx" ON "Tarifa"("parqueaderoId", "tipoVehiculo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_parqueaderoId_placa_key" ON "Vehiculo"("parqueaderoId", "placa");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoQr_token_key" ON "CodigoQr"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Movimiento_codigoTiquete_key" ON "Movimiento"("codigoTiquete");

-- CreateIndex
CREATE UNIQUE INDEX "Movimiento_corrigeAId_key" ON "Movimiento"("corrigeAId");

-- CreateIndex
CREATE INDEX "Movimiento_parqueaderoId_idx" ON "Movimiento"("parqueaderoId");

-- CreateIndex
CREATE INDEX "Pago_parqueaderoId_idx" ON "Pago"("parqueaderoId");

-- CreateIndex
CREATE INDEX "Bitacora_parqueaderoId_idx" ON "Bitacora"("parqueaderoId");

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personal" ADD CONSTRAINT "Personal_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consentimiento" ADD CONSTRAINT "Consentimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afiliacion" ADD CONSTRAINT "Afiliacion_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afiliacion" ADD CONSTRAINT "Afiliacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Celda" ADD CONSTRAINT "Celda_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarifa" ADD CONSTRAINT "Tarifa_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoVehiculo" ADD CONSTRAINT "VinculoVehiculo_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoVehiculo" ADD CONSTRAINT "VinculoVehiculo_afiliacionId_fkey" FOREIGN KEY ("afiliacionId") REFERENCES "Afiliacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VinculoVehiculo" ADD CONSTRAINT "VinculoVehiculo_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoVinculacion" ADD CONSTRAINT "CodigoVinculacion_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoVinculacion" ADD CONSTRAINT "CodigoVinculacion_afiliacionId_fkey" FOREIGN KEY ("afiliacionId") REFERENCES "Afiliacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoQr" ADD CONSTRAINT "CodigoQr_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodigoQr" ADD CONSTRAINT "CodigoQr_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_celdaId_fkey" FOREIGN KEY ("celdaId") REFERENCES "Celda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_tarifaId_fkey" FOREIGN KEY ("tarifaId") REFERENCES "Tarifa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_anuladoPorId_fkey" FOREIGN KEY ("anuladoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_dispositivoId_fkey" FOREIGN KEY ("dispositivoId") REFERENCES "Dispositivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_corrigeAId_fkey" FOREIGN KEY ("corrigeAId") REFERENCES "Movimiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_afiliacionId_fkey" FOREIGN KEY ("afiliacionId") REFERENCES "Afiliacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_tarifaId_fkey" FOREIGN KEY ("tarifaId") REFERENCES "Tarifa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_anuladoPorId_fkey" FOREIGN KEY ("anuladoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispositivo" ADD CONSTRAINT "Dispositivo_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_parqueaderoId_fkey" FOREIGN KEY ("parqueaderoId") REFERENCES "Parqueadero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
