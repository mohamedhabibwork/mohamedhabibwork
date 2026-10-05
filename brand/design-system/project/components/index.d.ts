/** MH design system — React components (window.MH). Props are documentation; the bundle is plain JS. */
import type { ReactNode, ReactElement, MouseEvent, ChangeEvent } from "react";

export type IconName = "alert-triangle" | "arrow-down-right" | "arrow-down" | "arrow-right" | "arrow-up-right" | "arrow-up" | "award" | "bar-chart" | "bell" | "bold" | "book" | "briefcase" | "calendar" | "check-circle" | "check" | "chevron-down" | "chevron-left" | "chevron-right" | "chevron-up" | "clock" | "code" | "command" | "copy" | "download" | "edit" | "external-link" | "eye-off" | "eye" | "file" | "filter" | "github" | "globe" | "grip" | "home" | "image" | "inbox" | "info" | "italic" | "layers" | "layout" | "link" | "linkedin" | "list" | "log-out" | "mail" | "map-pin" | "menu" | "minus" | "monitor" | "moon" | "more-horizontal" | "phone" | "plus" | "printer" | "search" | "send" | "server" | "settings" | "sparkles" | "star" | "sun" | "trash" | "upload" | "user" | "users" | "x-circle" | "x" | "zap";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
}
export declare function Button(props: ButtonProps): ReactElement;

export interface IconButtonProps {
  icon: IconName;
  label: string;
  variant?: "ghost" | "outline" | "primary";
  size?: "sm" | "md";
  onClick?: (e: MouseEvent) => void;
}
export declare function IconButton(props: IconButtonProps): ReactElement;

export interface BadgeProps {
  variant?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
  dot?: boolean;
  children: ReactNode;
}
export declare function Badge(props: BadgeProps): ReactElement;

export interface AvatarProps {
  name: string;
  src?: string;
  /** Name of a picture in Assets → Images, e.g. "profile". */
  photoAsset?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "away" | "offline";
}
export declare function Avatar(props: AvatarProps): ReactElement;

export interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: "sm" | "md" | "lg";
}
export declare function AvatarGroup(props: AvatarGroupProps): ReactElement;

export interface CardProps {
  eyebrow?: string;
  title?: string;
  interactive?: boolean;
  footer?: ReactNode;
  as?: "article" | "section" | "div";
  children?: ReactNode;
}
export declare function Card(props: CardProps): ReactElement;

export interface StatCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: "up" | "down";
}
export declare function StatCard(props: StatCardProps): ReactElement;

export interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}
export declare function ProgressBar(props: ProgressBarProps): ReactElement;

export interface StepperProps {
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
}
export declare function Stepper(props: StepperProps): ReactElement;

export interface TimelineProps {
  items: { title: string; meta?: string; body?: string }[];
}
export declare function Timeline(props: TimelineProps): ReactElement;

export interface TabsProps {
  items: { id: string; label: string; count?: number }[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  label?: string;
}
export declare function Tabs(props: TabsProps): ReactElement;

export interface PaginationProps {
  pageCount: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
}
export declare function Pagination(props: PaginationProps): ReactElement;

export interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}
export declare function Breadcrumb(props: BreadcrumbProps): ReactElement;

export interface NavbarProps {
  links: { label: string; href?: string }[];
  active?: string;
  action?: ReactNode;
  homeHref?: string;
  tagline?: string | false;
}
export declare function Navbar(props: NavbarProps): ReactElement;

export interface InputProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  leadingIcon?: IconName;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export declare function Input(props: InputProps): ReactElement;

export interface TextareaProps {
  label?: string;
  hint?: string;
  error?: string;
  rows?: number;
  placeholder?: string;
}
export declare function Textarea(props: TextareaProps): ReactElement;

export interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  hint?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
}
export declare function Select(props: SelectProps): ReactElement;

export interface SearchInputProps {
  placeholder?: string;
  shortcut?: string;
  label?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export declare function SearchInput(props: SearchInputProps): ReactElement;

export interface OtpInputProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  error?: boolean;
  label?: string;
}
export declare function OtpInput(props: OtpInputProps): ReactElement;

export interface CheckboxProps {
  label: ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export declare function Checkbox(props: CheckboxProps): ReactElement;

export interface RadioGroupProps {
  label?: string;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (value: string) => void;
}
export declare function RadioGroup(props: RadioGroupProps): ReactElement;

export interface SwitchProps {
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export declare function Switch(props: SwitchProps): ReactElement;

export interface AlertProps {
  variant?: "info" | "success" | "warning" | "danger" | "brand";
  title?: string;
  onDismiss?: () => void;
  children?: ReactNode;
}
export declare function Alert(props: AlertProps): ReactElement;

export interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "danger";
  actionLabel?: string;
  onAction?: () => void;
}
export declare function Toast(props: ToastProps): ReactElement;

export interface ModalProps {
  open?: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  onClose?: () => void;
  inline?: boolean;
  children?: ReactNode;
}
export declare function Modal(props: ModalProps): ReactElement;

export interface TooltipProps {
  content: ReactNode;
  open?: boolean;
  children: ReactElement;
}
export declare function Tooltip(props: TooltipProps): ReactElement;

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}
export declare function Spinner(props: SpinnerProps): ReactElement;

export interface SkeletonProps {
  lines?: number;
  avatar?: boolean;
}
export declare function Skeleton(props: SkeletonProps): ReactElement;

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}
export declare function EmptyState(props: EmptyStateProps): ReactElement;

export interface DataTableProps {
  columns: { key: string; label: string; align?: "start" | "end"; render?: (row: any) => ReactNode }[];
  rows: Record<string, any>[];
  caption?: string;
}
export declare function DataTable(props: DataTableProps): ReactElement;

export interface CodeBlockProps {
  code: string;
  prompt?: boolean;
}
export declare function CodeBlock(props: CodeBlockProps): ReactElement;

export interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  /** Element that receives data-theme. Default document.documentElement. */
  target?: HTMLElement;
  /** Save the preference to localStorage. Default true. */
  persist?: boolean;
  storageKey?: string;
  defaultValue?: "light" | "dark" | "system";
  withSystem?: boolean;
  iconOnly?: boolean;
  label?: string;
}
export declare function ThemeToggle(props: ThemeToggleProps): ReactElement;

export interface SegmentedControlProps {
  options: { value: string; label: string; icon?: IconName }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
}
export declare function SegmentedControl(props: SegmentedControlProps): ReactElement;

export interface LanguageSwitchProps {
  value?: "en" | "ar";
  defaultValue?: "en" | "ar";
  onChange?: (lang: "en" | "ar") => void;
  /** Set lang/dir on <html>. Default true. */
  applyToDocument?: boolean;
}
export declare function LanguageSwitch(props: LanguageSwitchProps): ReactElement;

export interface HeroProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  lead?: string;
  actions?: ReactNode;
  /** Show the mark trace. Default true. */
  art?: boolean;
  children?: ReactNode;
}
export declare function Hero(props: HeroProps): ReactElement;

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
}
export declare function SectionHeading(props: SectionHeadingProps): ReactElement;

export interface ProjectCardProps {
  title: string;
  href?: string;
  image?: string;
  /** Name of a picture in Assets → Images, e.g. "project-leap". */
  imageAsset?: string;
  category?: string;
  year?: string;
  description?: string;
  tags?: string[];
}
export declare function ProjectCard(props: ProjectCardProps): ReactElement;

export interface ChipProps {
  children: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}
export declare function Chip(props: ChipProps): ReactElement;

export interface ChipListProps {
  items: string[];
  label?: string;
}
export declare function ChipList(props: ChipListProps): ReactElement;

export interface ServiceCardProps {
  icon?: IconName;
  title: string;
  description?: string;
  points?: string[];
}
export declare function ServiceCard(props: ServiceCardProps): ReactElement;

export interface TestimonialProps {
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
  avatarAsset?: string;
}
export declare function Testimonial(props: TestimonialProps): ReactElement;

export interface SkillMeterProps {
  skills: { name: string; level: 1 | 2 | 3 | 4 | 5 }[];
}
export declare function SkillMeter(props: SkillMeterProps): ReactElement;

export interface SocialLinksProps {
  links: { label: string; icon: IconName; href?: string; external?: boolean }[];
  variant?: "ghost" | "outline";
}
export declare function SocialLinks(props: SocialLinksProps): ReactElement;

export interface CtaBandProps {
  title: string;
  description?: string;
  action?: ReactNode;
}
export declare function CtaBand(props: CtaBandProps): ReactElement;

export interface FooterProps {
  blurb?: string;
  columns?: { title: string; links: { label: string; href?: string }[] }[];
  legal?: string;
  end?: ReactNode;
}
export declare function Footer(props: FooterProps): ReactElement;

export interface PostCardProps {
  title: string;
  href?: string;
  date: string;
  readTime?: string;
  tag?: string;
  excerpt?: string;
}
export declare function PostCard(props: PostCardProps): ReactElement;

export interface DividerProps {
  label?: string;
}
export declare function Divider(props: DividerProps): ReactElement;

export interface KbdProps {
  children: ReactNode;
}
export declare function Kbd(props: KbdProps): ReactElement;

export interface BannerProps {
  children: ReactNode;
  variant?: "brand" | "neutral";
  linkLabel?: string;
  href?: string;
  onDismiss?: () => void;
}
export declare function Banner(props: BannerProps): ReactElement;

export interface AppShellProps {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}
export declare function AppShell(props: AppShellProps): ReactElement;

export interface SidebarProps {
  groups: { label?: string; items: { label: string; icon?: IconName; href?: string; count?: number }[] }[];
  active?: string;
  user?: { name: string; role?: string; avatar?: string; avatarAsset?: string };
  brand?: ReactNode;
  tagline?: string;
}
export declare function Sidebar(props: SidebarProps): ReactElement;

export interface TopbarProps {
  title: string;
  leading?: ReactNode;
  actions?: ReactNode;
  search?: boolean;
  searchPlaceholder?: string;
  themeToggle?: boolean;
  persistTheme?: boolean;
}
export declare function Topbar(props: TopbarProps): ReactElement;

export interface DropdownMenuProps {
  items: ({ label: string; icon?: IconName; shortcut?: string; danger?: boolean; onSelect?: () => void } | { heading: string } | "-")[];
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  align?: "start" | "end";
  label?: string;
}
export declare function DropdownMenu(props: DropdownMenuProps): ReactElement;

export interface DrawerProps {
  title: string;
  open?: boolean;
  onClose?: () => void;
  footer?: ReactNode;
  inline?: boolean;
  children?: ReactNode;
  side?: "right" | "left" | "bottom";
}
export declare function Drawer(props: DrawerProps): ReactElement;

export interface AccordionProps {
  items: { title: string; content: ReactNode }[];
  multiple?: boolean;
  defaultOpen?: number[];
}
export declare function Accordion(props: AccordionProps): ReactElement;

export interface SliderProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  format?: (v: number) => string;
  onChange?: (v: number) => void;
}
export declare function Slider(props: SliderProps): ReactElement;

export interface FileDropProps {
  accept?: string;
  multiple?: boolean;
  hint?: string;
  files?: { name: string; size: number }[];
  defaultFiles?: { name: string; size: number }[];
  onChange?: (files: { name: string; size: number }[], raw?: FileList) => void;
}
export declare function FileDrop(props: FileDropProps): ReactElement;

export interface TagInputProps {
  label?: string;
  hint?: string;
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  onChange?: (tags: string[]) => void;
}
export declare function TagInput(props: TagInputProps): ReactElement;

export interface DescriptionListProps {
  items: { term: string; value: ReactNode }[];
}
export declare function DescriptionList(props: DescriptionListProps): ReactElement;

export interface ActivityFeedProps {
  items: { actor: string; action: string; target?: string; time: string; unread?: boolean }[];
}
export declare function ActivityFeed(props: ActivityFeedProps): ReactElement;

export interface BarChartProps {
  labels: string[];
  series: { name: string; data: number[] }[];
  height?: number;
  legend?: boolean;
  label?: string;
  format?: (v: number) => string;
}
export declare function BarChart(props: BarChartProps): ReactElement;

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  label?: string;
}
export declare function Sparkline(props: SparklineProps): ReactElement;

export interface ToolbarProps {
  search?: boolean;
  searchPlaceholder?: string;
  filters?: { label: string; active?: boolean; onClick?: () => void }[];
  actions?: ReactNode;
  label?: string;
}
export declare function Toolbar(props: ToolbarProps): ReactElement;

export interface BulkActionBarProps {
  count: number;
  actions?: ReactNode;
  onClear?: () => void;
}
export declare function BulkActionBar(props: BulkActionBarProps): ReactElement;

export interface CommandPaletteProps {
  items: { label: string; group?: string; icon?: IconName; shortcut?: string; onSelect?: () => void }[];
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (item: { label: string }) => void;
  onClose?: () => void;
}
export declare function CommandPalette(props: CommandPaletteProps): ReactElement;

export interface PortfolioPageProps {
  persistTheme?: boolean;
}
export declare function PortfolioPage(props: PortfolioPageProps): ReactElement;

export interface AdminDashboardPageProps {
  persistTheme?: boolean;
}
export declare function AdminDashboardPage(props: AdminDashboardPageProps): ReactElement;

export interface SignInPageProps {
  persistTheme?: boolean;
}
export declare function SignInPage(props: SignInPageProps): ReactElement;

export interface RangeSliderProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  format?: (v: number) => string;
  onChange?: (v: [number, number]) => void;
}
export declare function RangeSlider(props: RangeSliderProps): ReactElement;

export interface CarouselProps {
  slides: ReactNode[];
  perView?: number;
  index?: number;
  defaultIndex?: number;
  onChange?: (i: number) => void;
  autoPlay?: boolean;
  interval?: number;
  label?: string;
}
export declare function Carousel(props: CarouselProps): ReactElement;

export interface FormSectionProps {
  title: string;
  description?: string;
  columns?: 1 | 2;
  footer?: ReactNode;
  children: ReactNode;
}
export declare function FormSection(props: FormSectionProps): ReactElement;

export interface NumberInputProps {
  label?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  error?: string;
  onChange?: (v: number) => void;
}
export declare function NumberInput(props: NumberInputProps): ReactElement;

export interface PasswordInputProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  meter?: boolean;
  hint?: string;
  error?: string;
  onChange?: (v: string) => void;
}
export declare function PasswordInput(props: PasswordInputProps): ReactElement;

export interface PhoneInputProps {
  label?: string;
  codes?: { value: string; label: string }[];
  defaultCode?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onCodeChange?: (code: string) => void;
}
export declare function PhoneInput(props: PhoneInputProps): ReactElement;

export interface DateRangeFieldProps {
  label?: string;
  value?: { start: string; end: string; current?: boolean };
  defaultValue?: { start: string; end: string; current?: boolean };
  allowCurrent?: boolean;
  currentLabel?: string;
  onChange?: (v: { start: string; end: string; current?: boolean }) => void;
}
export declare function DateRangeField(props: DateRangeFieldProps): ReactElement;

export interface RatingProps {
  label?: string;
  max?: number;
  value?: number;
  defaultValue?: number;
  readOnly?: boolean;
  size?: number;
  onChange?: (v: number) => void;
}
export declare function Rating(props: RatingProps): ReactElement;

export interface SwatchPickerProps {
  swatches: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  label?: string;
  onChange?: (v: string) => void;
}
export declare function SwatchPicker(props: SwatchPickerProps): ReactElement;

export interface RichTextEditorProps {
  label?: string;
  defaultHtml?: string;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
  onAssist?: () => void;
  assistLabel?: string;
}
export declare function RichTextEditor(props: RichTextEditorProps): ReactElement;

export interface PhotoUploadProps {
  name?: string;
  src?: string;
  defaultSrc?: string;
  /** Start from a picture in Assets → Images. */
  defaultAsset?: string;
  label?: string;
  hint?: string;
  onChange?: (url: string, file?: File) => void;
}
export declare function PhotoUpload(props: PhotoUploadProps): ReactElement;

export interface SectionEditorProps {
  title: string;
  icon?: IconName;
  count?: number;
  open?: boolean;
  defaultOpen?: boolean;
  draggable?: boolean;
  onToggle?: (open: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  menu?: ReactNode;
  children?: ReactNode;
}
export declare function SectionEditor(props: SectionEditorProps): ReactElement;

export interface RepeatableListProps {
  items?: any[];
  defaultItems?: any[];
  onChange?: (items: any[]) => void;
  renderItem?: (item: any, index: number, patch: (p: object) => void) => ReactNode;
  titleOf?: (item: any) => string;
  subtitleOf?: (item: any) => string;
  newItem?: () => object;
  addLabel?: string;
  defaultOpenIndex?: number;
}
export declare function RepeatableList(props: RepeatableListProps): ReactElement;

export interface CompletenessMeterProps {
  steps: { label: string; done: boolean; hint?: string }[];
  label?: string;
}
export declare function CompletenessMeter(props: CompletenessMeterProps): ReactElement;

export interface TemplatePickerProps {
  templates?: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  label?: string;
  onChange?: (v: string) => void;
}
export declare function TemplatePicker(props: TemplatePickerProps): ReactElement;

export interface CvPreviewProps {
  cv?: {
    name: string; title?: string; email?: string; phone?: string; location?: string; website?: string; photo?: string; photoAsset?: string;
    summary?: string;
    experience?: { role: string; company: string; start: string; end?: string; current?: boolean; bullets?: string[] }[];
    education?: { degree: string; school: string; start: string; end: string }[];
    skills?: { name: string; level: number }[];
    languages?: { name: string; level: string }[];
  };
  template?: "modern" | "classic" | "compact";
  /** Must read at 4.5:1 on white. Default #3d5806 (lime-900). */
  accent?: string;
}
export declare function CvPreview(props: CvPreviewProps): ReactElement;

export interface CvBuilderPageProps {
  persistTheme?: boolean;
}
export declare function CvBuilderPage(props: CvBuilderPageProps): ReactElement;
