const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
        
        <p>
          © {new Date().getFullYear()} HostelOS. All rights reserved.
        </p>

        <div className="flex gap-4 mt-2 md:mt-0">
          <span className="hover:text-blue-600 cursor-pointer">Privacy</span>
          <span className="hover:text-blue-600 cursor-pointer">Terms</span>
          <span className="hover:text-blue-600 cursor-pointer">Support</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;