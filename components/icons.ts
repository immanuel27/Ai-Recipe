/**
 * The app's icon vocabulary: one concept, one glyph. Import icons from here,
 * never from the package, so "share" is always the same paper plane.
 *
 * Phosphor rules: regular weight by default; weight="fill" for the active nav
 * item and on-states (liked, saved); bold only at 16px or smaller.
 * Sizes: 24 rail, tab bar and post actions; 20 buttons and menus; 16 inline.
 *
 * The SSR build has no React context, so it works in server and client components.
 */
export {
  // Navigation
  House as HomeIcon,
  FilmReel as ReelsIcon,
  MagnifyingGlass as SearchIcon,
  Compass as ExploreIcon,
  Plus as CreateIcon,
  ChartBar as DashboardIcon,
  List as MoreIcon,
  User as UserIcon,
  // Post actions
  Heart as LikeIcon,
  PaperPlaneTilt as ShareIcon,
  BookmarkSimple as SaveIcon,
  DotsThree as PostMenuIcon,
  // Media controls
  SpeakerSlash as MutedIcon,
  SpeakerHigh as SoundIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  CornersOut as FullscreenIcon,
  CornersIn as ExitFullscreenIcon,
  FilmStrip as VideoIcon,
  Images as CarouselIcon,
  ImageSquare as ImageIcon,
  ImageBroken as ImageMissingIcon,
  UploadSimple as UploadIcon,
  // General
  Plus as PlusIcon,
  X as CloseIcon,
  Check as CheckIcon,
  CaretDown as CaretDownIcon,
  CaretUp as CaretUpIcon,
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  ArrowLeft as BackIcon,
  ArrowUpRight as GoIcon,
  ArrowRight as ForwardIcon,
  CircleNotch as SpinnerIcon,
  Lock as LockIcon,
  Copy as CopyIcon,
  PencilSimple as EditIcon,
  Trash as DeleteIcon,
  FunnelSimple as FilterIcon,
  Envelope as EmailIcon,
  FileText as DocumentIcon,
  ArrowSquareOut as OpenIcon,
  EyeSlash as HideIcon,
  LinkSimple as LinkIcon,
  SignOut as LogOutIcon,
  // Recipe anatomy
  ChatText as PromptsIcon,
  SlidersHorizontal as RecipeSettingsIcon,
  Stack as EditStackIcon,
  Users as CreatorsIcon,
  // Commerce and profile
  Receipt as SalesIcon,
  ShoppingBag as PurchasedIcon,
  Storefront as StoreIcon,
  CurrencyDollar as PayoutsIcon,
  SquaresFour as PostsIcon,
  GearSix as SettingsIcon,
  UserMinus as UserMissingIcon,
  // Theme
  Sun as LightIcon,
  Moon as DarkIcon,
  Desktop as SystemIcon,
  // Status (always with a label)
  CheckCircle as SuccessIcon,
  SealCheck as VerifiedIcon,
  Globe as WebsiteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  XCircle as ErrorIcon,
  // Brands
  GoogleLogo as GoogleIcon,
  InstagramLogo as InstagramIcon,
  XLogo as XBrandIcon,
  FacebookLogo as FacebookIcon,
  LinkedinLogo as LinkedInIcon,
} from "@phosphor-icons/react/dist/ssr"

export type { Icon as IconType } from "@phosphor-icons/react"
