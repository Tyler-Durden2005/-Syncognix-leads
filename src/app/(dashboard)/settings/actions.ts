"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth/user"
import { validateName } from "@/lib/validation"
import type { ActionState } from "@/types"

export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = formData.get("fullName")
  const fullName = typeof raw === "string" ? raw.trim() : ""

  const nameError = validateName(fullName)
  if (nameError) {
    return { status: "error", fieldErrors: { fullName: nameError }, values: { fullName } }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { status: "error", message: "Your session has expired. Please sign in again." }
  }

  try {
    const supabase = await createClient()
    // Upsert covers accounts created before the profiles trigger existed.
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" })

    if (error) {
      return {
        status: "error",
        message: "We couldn't save your profile. Please try again.",
        values: { fullName },
      }
    }
  } catch {
    return {
      status: "error",
      message: "We couldn't reach the server. Check your connection and try again.",
      values: { fullName },
    }
  }

  revalidatePath("/", "layout")
  return { status: "success", message: "Profile updated.", values: { fullName } }
}
