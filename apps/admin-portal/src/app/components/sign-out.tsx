import { signOut } from "@/app/lib/auth";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button 
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Sign Out
      </button>
    </form>
  );
}