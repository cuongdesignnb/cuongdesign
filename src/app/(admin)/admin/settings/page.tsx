import { prisma } from "@/lib/db";
import AdminSettingsForm from "@/components/sections/AdminSettingsForm";

export default async function AdminSettingsPage() {
  // Query all system settings from the database
  const dbSettings = await prisma.setting.findMany();
  
  // Format as a simple key-value object
  const settingsObj: Record<string, string> = {};
  dbSettings.forEach((s) => {
    settingsObj[s.key] = s.value;
  });
  const configuredSecrets = {
    textApiKey: Boolean(
      settingsObj.openai_text_api_key ||
        settingsObj.openai_api_key ||
        process.env.OPENAI_TEXT_API_KEY ||
        process.env.OPENAI_API_KEY,
    ),
    imageApiKey: Boolean(
      settingsObj.openai_image_api_key || process.env.OPENAI_IMAGE_API_KEY,
    ),
  };
  delete settingsObj.openai_text_api_key;
  delete settingsObj.openai_image_api_key;
  delete settingsObj.openai_api_key;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Cấu hình Hệ thống</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý màu sắc giao diện, email báo cáo SMTP, tích hợp cổng thông báo Telegram và các từ khóa AI.
        </p>
      </div>

      <AdminSettingsForm
        initialSettings={settingsObj}
        configuredSecrets={configuredSecrets}
      />
    </div>
  );
}
