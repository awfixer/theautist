function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="mb-16">
      <ul className="font-sm mt-8 flex flex-col space-x-0 space-y-2 text-neutral-300 md:flex-row md:space-x-4 md:space-y-0">
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="/rss"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">rss</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/awfixer"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">github</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center transition-all hover:text-neutral-100"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/awfixer/theautist"
          >
            <ArrowIcon />
            <p className="ml-2 h-7">source</p>
          </a>
        </li>
  33    <li>
  34      <a
  35        className="flex items-center transition-all hover:text-neutral-100"
  36        rel="noopener noreferrer"
  37        target="_blank"
  38        href="https://railway.com?referralCode=nyJTRu"
  39      >
  40        <ArrowIcon />
  41        <p className="ml-2 h-7">railway</p>
  42       </a>
  43    </li>
	</ul>
      <p className="mt-8 text-neutral-300">
        © {new Date().getFullYear()} MIT Licensed
      </p>
    </footer>
  )
}
