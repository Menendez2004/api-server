-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('VERIFICATION_EMAIL', 'RESET_PASS');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('MANAGER', 'CLIENT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "addresses" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 2,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" "RoleName" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "id_user" UUID NOT NULL,
    "token_type" INTEGER NOT NULL,
    "is_used" BOOLEAN NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationType" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "tokenType" "TokenType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "uuid_user" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "uuid_cart" UUID NOT NULL,
    "uuid_product" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "uuid_user" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "uuid_order" UUID NOT NULL,
    "uuid_product" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "uuid_user" UUID NOT NULL,
    "uuid_product" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "uuid_product" UUID NOT NULL,
    "uuid_category" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("uuid_product","uuid_category")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImages" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "uuid_product" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_id_uuid_idx" ON "User"("email", "id", "uuid");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_uuid_key" ON "UserRole"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_id_user_idx" ON "VerificationToken"("id_user");

-- CreateIndex
CREATE INDEX "VerificationToken_expired_at_idx" ON "VerificationToken"("expired_at");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationType_uuid_key" ON "VerificationType"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Product_uuid_key" ON "Product"("uuid");

-- CreateIndex
CREATE INDEX "Product_id_is_available_idx" ON "Product"("id", "is_available");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_uuid_key" ON "Cart"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_uuid_user_key" ON "Cart"("uuid_user");

-- CreateIndex
CREATE INDEX "Cart_uuid_user_idx" ON "Cart"("uuid_user");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_uuid_key" ON "CartItem"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_uuid_cart_key" ON "CartItem"("uuid_cart");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_uuid_product_key" ON "CartItem"("uuid_product");

-- CreateIndex
CREATE INDEX "CartItem_uuid_cart_uuid_product_uuid_idx" ON "CartItem"("uuid_cart", "uuid_product", "uuid");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_uuid_cart_uuid_product_key" ON "CartItem"("uuid_cart", "uuid_product");

-- CreateIndex
CREATE UNIQUE INDEX "Order_uuid_key" ON "Order"("uuid");

-- CreateIndex
CREATE INDEX "Order_id_uuid_user_idx" ON "Order"("id", "uuid_user");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetail_uuid_key" ON "OrderDetail"("uuid");

-- CreateIndex
CREATE INDEX "OrderDetail_uuid_order_uuid_product_id_uuid_idx" ON "OrderDetail"("uuid_order", "uuid_product", "id", "uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_uuid_user_key" ON "Favorite"("uuid_user");

-- CreateIndex
CREATE INDEX "Favorite_uuid_user_id_idx" ON "Favorite"("uuid_user", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_uuid_user_uuid_product_key" ON "Favorite"("uuid_user", "uuid_product");

-- CreateIndex
CREATE INDEX "ProductCategory_uuid_product_uuid_category_idx" ON "ProductCategory"("uuid_product", "uuid_category");

-- CreateIndex
CREATE UNIQUE INDEX "Category_uuid_key" ON "Category"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImages_uuid_key" ON "ProductImages"("uuid");

-- CreateIndex
CREATE INDEX "ProductImages_uuid_product_id_idx" ON "ProductImages"("uuid_product", "id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_token_type_fkey" FOREIGN KEY ("token_type") REFERENCES "VerificationType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_uuid_user_fkey" FOREIGN KEY ("uuid_user") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_uuid_cart_fkey" FOREIGN KEY ("uuid_cart") REFERENCES "Cart"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_uuid_product_fkey" FOREIGN KEY ("uuid_product") REFERENCES "Product"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_uuid_user_fkey" FOREIGN KEY ("uuid_user") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_uuid_order_fkey" FOREIGN KEY ("uuid_order") REFERENCES "Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_uuid_product_fkey" FOREIGN KEY ("uuid_product") REFERENCES "Product"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_uuid_user_fkey" FOREIGN KEY ("uuid_user") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_uuid_product_fkey" FOREIGN KEY ("uuid_product") REFERENCES "Product"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_uuid_product_fkey" FOREIGN KEY ("uuid_product") REFERENCES "Product"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_uuid_category_fkey" FOREIGN KEY ("uuid_category") REFERENCES "Category"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImages" ADD CONSTRAINT "ProductImages_uuid_product_fkey" FOREIGN KEY ("uuid_product") REFERENCES "Product"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
