/*
  Warnings:

  - You are about to drop the column `evolucao_clinica` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `exames_solicitados` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `hora_chegada` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `hora_finalizacao` on the `Atendimento` table. All the data in the column will be lost.
  - You are about to drop the column `hora_inicio_atend` on the `Atendimento` table. All the data in the column will be lost.
  - The `prioridade` column on the `Atendimento` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Atendimento" DROP COLUMN "evolucao_clinica",
DROP COLUMN "exames_solicitados",
DROP COLUMN "hora_chegada",
DROP COLUMN "hora_finalizacao",
DROP COLUMN "hora_inicio_atend",
ADD COLUMN     "convenio" TEXT NOT NULL DEFAULT 'PARTICULAR',
ADD COLUMN     "diagnostico" TEXT,
ADD COLUMN     "numero_guia" TEXT,
ADD COLUMN     "prescricao" TEXT,
ADD COLUMN     "servicoId" TEXT,
ADD COLUMN     "sintomas" TEXT,
DROP COLUMN "prioridade",
ADD COLUMN     "prioridade" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Exame" (
    "id" TEXT NOT NULL,
    "atendimentoId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "exame" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidade" TEXT NOT NULL,
    "precoCusto" DOUBLE PRECISION NOT NULL,
    "validade" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campanha" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "desconto" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campanha_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exame" ADD CONSTRAINT "Exame_atendimentoId_fkey" FOREIGN KEY ("atendimentoId") REFERENCES "Atendimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
