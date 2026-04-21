import { z } from "zod";
import { publicProcedure } from "../index";

const contactSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.email("Please enter a valid email address"),
	subject: z.string().min(5, "Subject must be at least 5 characters"),
	message: z.string().min(20, "Message must be at least 20 characters"),
});

export const appRouter = {
	healthCheck: publicProcedure.handler(() => "OK"),
	contact: publicProcedure.input(contactSchema).handler(async ({ input }) => {
		const { name, email, subject } = input;

		console.log("Contact form submission:", { name, email, subject });

		return {
			success: true,
			message: "Thank you for your message. I'll get back to you soon!",
		};
	}),
};
export type AppRouter = typeof appRouter;
