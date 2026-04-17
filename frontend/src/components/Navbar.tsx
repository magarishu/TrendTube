import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="bg-[#121212] border-b border-gray-700 sticky top-0 z-40 shadow-xl">
      <div className="px-6 lg:px-10 py-4 flex items-center justify-end gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#293548] transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF0000] rounded-full animate-pulse"></span>
        </Button>

        {/* User Profile */}
        <Button
          variant="ghost"
          size="icon"
          className="text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#293548] transition-colors"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;


