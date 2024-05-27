-- CreateTable
CREATE TABLE "backpack" (
    "client_id" BIGINT NOT NULL,
    "mousetrap" INTEGER NOT NULL DEFAULT 0,
    "net" INTEGER NOT NULL DEFAULT 0,
    "lasso" INTEGER NOT NULL DEFAULT 0,
    "beartrap" INTEGER NOT NULL DEFAULT 0,
    "safe" INTEGER NOT NULL DEFAULT 0,
    "shmoins" INTEGER NOT NULL DEFAULT 0,
    "luckyshmoin" INTEGER NOT NULL DEFAULT 0,
    "shmoizberry" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "backpack_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "box" (
    "client_id" BIGINT NOT NULL,
    "id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xp_required" INTEGER DEFAULT 100,

    CONSTRAINT "box_pk" PRIMARY KEY ("client_id","id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "client_id" BIGINT NOT NULL,
    "id" INTEGER NOT NULL,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("client_id","id")
);

-- CreateTable
CREATE TABLE "monsters" (
    "id" SERIAL NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "class" VARCHAR(15) NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "rarity" VARCHAR(15) NOT NULL,
    "created_on" TIMESTAMP(6) NOT NULL,
    "img" VARCHAR(100),

    CONSTRAINT "monsters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "client_id" BIGINT NOT NULL,
    "monsters_owned" INTEGER DEFAULT 0,

    CONSTRAINT "player_pkey" PRIMARY KEY ("client_id")
);

-- AddForeignKey
ALTER TABLE "backpack" ADD CONSTRAINT "backpack_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "player"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "box" ADD CONSTRAINT "box_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "player"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "box" ADD CONSTRAINT "box_id_fkey" FOREIGN KEY ("id") REFERENCES "monsters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

