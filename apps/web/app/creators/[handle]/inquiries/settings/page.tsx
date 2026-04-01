import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import InquirySettingsContent from "./inquiry-settings-content";

export default async function InquirySettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    return <InquirySettingsContent />;
}
