/* Legacy route retained for existing links. */
import { redirect } from "next/navigation";

export default function LegacyExaminationPage() {
  redirect("/exams");
}
