import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InquiriesContent from "./inquiries-content";

export default async function InquiriesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    return <InquiriesContent />;
}
