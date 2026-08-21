import { prisma } from "../lib/db/prisma";

export interface RegisterUserInput {
  username: string;
  password: string;
  name: string;
  role: "ADMIN" | "CASHIER";
}

export interface LoginUserInput {
  username: string;
  password: string;
}

/**
 * Mendaftarkan user baru dengan verifikasi keunikan username dan password hashing
 */
export async function registerUser(input: RegisterUserInput) {
  const { username, password, name, role } = input;

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error("Username sudah digunakan");
  }

  const hashedPassword = await Bun.password.hash(password);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
      role,
    },
  });

  return { message: "User berhasil dibuat", userId: user.id };
}

/**
 * Memverifikasi username dan password user
 */
export async function verifyUserCredentials(input: LoginUserInput) {
  const { username, password } = input;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("Username atau password salah");
  }

  const isPasswordValid = await Bun.password.verify(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Username atau password salah");
  }

  return user;
}
