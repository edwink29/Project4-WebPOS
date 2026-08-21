import { Elysia, t } from "elysia";
import { prisma } from "../lib/db/prisma";

export const categoryRoutes = new Elysia({ prefix: "/categories" })
  .get("/", async () => {
    return await prisma.category.findMany();
  })
  .post(
    "/",
    async ({ body, set }) => {
      const category = await prisma.category.create({ data: body });
      set.status = 201;
      return category;
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    },
  )
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      return await prisma.category.update({
        where: { id },
        data: body,
      });
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    },
  )
  .delete("/:id", async ({ params: { id } }) => {
    return await prisma.category.delete({
      where: { id },
    });
  });
