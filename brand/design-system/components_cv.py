# Specs for sliders, form building blocks and the CV builder. exec()'d by build_ds.py after components_more.py.
_js = (ROOT / "project/components/bundle.js").read_text()
_icons = __import__("json").loads(re.search(r'var ICON_NAMES = (\[.*?\]);', _js).group(1))
_union = " | ".join(f'"{n}"' for n in dict.fromkeys(_icons))
_g, _hgt, _rd, _pr, _dm = C["Icon"]
C["Icon"] = (_g, _hgt + 40, _rd, re.sub(r'name: "check"[^;]*;', f"name: {_union};", _pr), _dm)

_g, _hgt, _rd, _pr, _dm = C["Drawer"]
C["Drawer"] = (_g, 380, _rd + "\n- `side`: `right` (default) for detail and edit panels, `left` for navigation on small screens, `bottom` for a mobile bottom sheet (with a grab handle).",
  _pr + '\n  side?: "right" | "left" | "bottom";',
  '''(function(){var s=React.useState("right");return h("div",{className:"mh-stack",style:{gap:12}},h(M.SegmentedControl,{label:"Side",value:s[0],onChange:s[1],options:[{value:"left",label:"Left"},{value:"right",label:"Right"},{value:"bottom",label:"Bottom sheet"}]}),h(M.Drawer,{key:s[0],side:s[0],inline:true,title:s[0]==="bottom"?"Share CV":"Edit project",onClose:()=>{},footer:[h(M.Button,{key:1,variant:"ghost"},"Cancel"),h(M.Button,{key:2},"Save")]},h(M.Input,{label:"Title",defaultValue:"LEAP platform"}),h(M.Select,{label:"Status",options:[{value:"live",label:"Live"},{value:"draft",label:"Draft"}]})))})()''')

comp("RangeSlider", "Forms", 110, """
Pick a minimum and maximum on one track (salary range, years of experience, price filters). Two native range inputs, so keyboard and screen readers work; the thumbs can't cross.
""", """
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  defaultValue?: [number, number];
  format?: (v: number) => string;
  onChange?: (v: [number, number]) => void;
""", """
h("div",{className:"mh-stack"},h(M.RangeSlider,{label:"Salary",min:1000,max:10000,step:250,defaultValue:[3000,7500],format:v=>"$"+(v/1000).toFixed(1)+"k"}),h(M.Slider,{label:"Years of experience",min:0,max:20,defaultValue:12}))
""")

comp("Carousel", "Site", 330, """
A slider for testimonials, project shots or certificates: one or more slides per view, arrow buttons, slanted dots, swipe on touch and arrow keys. `autoPlay` pauses under reduced motion.
""", """
  slides: ReactNode[];
  perView?: number;
  index?: number;
  defaultIndex?: number;
  onChange?: (i: number) => void;
  autoPlay?: boolean;
  interval?: number;
  label?: string;
""", """
h(M.Carousel,{label:"Testimonials",perView:2,slides:[h(M.Testimonial,{key:1,quote:"Turned a tangle of services into a platform the whole team understands.",name:"Sara Ali",role:"CTO, LEAP"}),h(M.Testimonial,{key:2,quote:"Calm under pressure; shipped our MVP in six weeks.",name:"Omar K",role:"Founder"}),h(M.Testimonial,{key:3,quote:"The best code reviews I've had.",name:"Lee C",role:"Engineer"}),h(M.Testimonial,{key:4,quote:"Architecture we're still happy with three years later.",name:"Ana B",role:"VP Engineering"})]})
""")

comp("FormSection", "Forms", 260, """
A settings or profile form section: title and description on the left, fields on the right (stacking under 560px), optional footer with Save. `columns={2}` puts fields side by side.
""", """
  title: string;
  description?: string;
  columns?: 1 | 2;
  footer?: ReactNode;
  children: ReactNode;
""", """
h(M.FormSection,{title:"Public profile",description:"Shown on your portfolio and CV.",columns:2,footer:[h(M.Button,{key:1,variant:"ghost"},"Cancel"),h(M.Button,{key:2},"Save")]},h(M.Input,{label:"Full name",defaultValue:"Mohamed Habib"}),h(M.Input,{label:"Headline",defaultValue:"Tech Lead"}),h(M.Select,{label:"Country",options:[{value:"eg",label:"Egypt"},{value:"sa",label:"Saudi Arabia"}]}),h(M.Input,{label:"Website",defaultValue:"https://habib.dev"}))
""")

comp("NumberInput", "Forms", 110, """
A number with − / + steppers, clamped to `min`/`max`, monospace digits and an optional unit.
""", """
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
""", """
h("div",{className:"mh-row",style:{gap:24,alignItems:"flex-start"}},h(M.NumberInput,{label:"Years of experience",defaultValue:12,min:0,max:50}),h(M.NumberInput,{label:"Hourly rate",defaultValue:80,step:5,unit:"USD"}))
""")

comp("PasswordInput", "Forms", 140, """
Password field with a show/hide button and a four-step strength meter (red, amber, green, each with a word). Turn the meter off on sign-in forms with `meter={false}`.
""", """
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  meter?: boolean;
  hint?: string;
  error?: string;
  onChange?: (v: string) => void;
""", """
h(M.PasswordInput,{label:"New password",defaultValue:"leap-2026"})
""")

comp("PhoneInput", "Forms", 110, """
Country code select (Gulf and Egypt first) beside a national-number field with `type="tel"`. Store the two parts separately; format on display.
""", """
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
""", """
h(M.PhoneInput,{label:"Phone",hint:"Used only for interview scheduling."})
""")

comp("DateRangeField", "Forms", 170, """
Start and end month for a job or degree, with "I currently work here" that disables End and shows "Present". Values are `YYYY-MM` strings.
""", """
  label?: string;
  value?: { start: string; end: string; current?: boolean };
  defaultValue?: { start: string; end: string; current?: boolean };
  allowCurrent?: boolean;
  currentLabel?: string;
  onChange?: (v: { start: string; end: string; current?: boolean }) => void;
""", """
h(M.DateRangeField,{label:"Dates",defaultValue:{start:"2024-01",end:"",current:true}})
""")

comp("Rating", "Forms", 90, """
Star rating as a radio group (keyboard and screen-reader friendly). Use `readOnly` to display a score; amber stars keep their meaning without relying on colour alone (filled vs outline).
""", """
  label?: string;
  max?: number;
  value?: number;
  defaultValue?: number;
  readOnly?: boolean;
  size?: number;
  onChange?: (v: number) => void;
""", """
h("div",{className:"mh-row",style:{gap:32}},h(M.Rating,{label:"Rate this course",defaultValue:4}),h(M.Rating,{label:"Average",defaultValue:5,readOnly:true,size:16}))
""")

comp("SwatchPicker", "Forms", 80, """
Pick one colour from a short, curated set (a CV accent, a tag colour). Each swatch is a labelled radio. Never offer colours that fail contrast where they'll be used.
""", """
  swatches: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  label?: string;
  onChange?: (v: string) => void;
""", """
h(M.SwatchPicker,{label:"Accent colour",swatches:[{value:"#3d5806",label:"Olive (brand)"},{value:"#0b0d0a",label:"Carbon"},{value:"#2366a8",label:"Blue"},{value:"#8f5400",label:"Amber"},{value:"#7a5fc9",label:"Violet"}]})
""")

comp("RichTextEditor", "Forms", 220, """
A light rich-text field (bold, italic, bullets) for CV summaries, job descriptions and posts, with an optional "Improve" assist button for an AI rewrite you wire up. Output is HTML via `onChange`; sanitise it server-side before storing.
""", """
  label?: string;
  defaultHtml?: string;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  onChange?: (html: string) => void;
  onAssist?: () => void;
  assistLabel?: string;
""", """
h(M.RichTextEditor,{label:"Role highlights",defaultHtml:"<ul><li>Architected an LMS + network on Bun and Flutter.</li><li>Raised coverage to <b>82%</b>.</li></ul>",onAssist:()=>{},hint:"Start each line with a verb."})
""")

comp("PhotoUpload", "CV builder", 110, """
Profile photo picker: preview frame (initials until a photo is set), Upload/Replace and Remove. Returns an object URL and the File; upload it yourself.
""", """
  name?: string;
  src?: string;
  defaultSrc?: string;
  /** Start from a picture in Assets → Images. */
  defaultAsset?: string;
  label?: string;
  hint?: string;
  onChange?: (url: string, file?: File) => void;
""", """
h(M.PhotoUpload,{name:"Mohamed Habib",defaultAsset:"profile"})
""")

comp("SectionEditor", "CV builder", 270, """
A collapsible CV/profile section card: drag grip, slanted icon tile, title with count, optional move up/down and a menu. Holds that section's form.
""", """
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
""", """
h("div",{className:"mh-stack",style:{gap:8}},h(M.SectionEditor,{title:"Profile summary",icon:"edit",onMoveUp:()=>{},onMoveDown:()=>{}},h(M.Textarea,{label:"Summary",defaultValue:"Tech lead with 12 years building reliable platforms."})),h(M.SectionEditor,{title:"Experience",icon:"briefcase",count:2,defaultOpen:false}))
""")

comp("RepeatableList", "CV builder", 330, """
Add, edit, reorder and remove entries (jobs, degrees, projects). One entry is open at a time; `renderItem(item, index, patch)` draws its fields and `patch` merges changes.
""", """
  items?: any[];
  defaultItems?: any[];
  onChange?: (items: any[]) => void;
  renderItem?: (item: any, index: number, patch: (p: object) => void) => ReactNode;
  titleOf?: (item: any) => string;
  subtitleOf?: (item: any) => string;
  newItem?: () => object;
  addLabel?: string;
  defaultOpenIndex?: number;
""", """
h(M.RepeatableList,{addLabel:"Add experience",defaultItems:[{role:"Tech Lead",company:"LEAP",start:"2024",end:"Present"},{role:"Senior Developer",company:"Freelance",start:"2020",end:"2024"}],titleOf:x=>(x.role||"New role")+(x.company?" · "+x.company:""),subtitleOf:x=>x.start+" — "+x.end,newItem:()=>({role:"",company:"",start:"",end:""}),renderItem:(x,i,patch)=>h("div",{className:"mh-formsec__body mh-formsec__body--2"},h(M.Input,{label:"Role",value:x.role,onChange:e=>patch({role:e.target.value})}),h(M.Input,{label:"Company",value:x.company,onChange:e=>patch({company:e.target.value})}))})
""")

comp("CompletenessMeter", "CV builder", 160, """
"CV strength": a percentage, progress bar and checklist of what's left (with optional gain hints). Motivates without nagging; never block saving on it.
""", """
  steps: { label: string; done: boolean; hint?: string }[];
  label?: string;
""", """
h(M.CompletenessMeter,{steps:[{label:"Contact details",done:true},{label:"Profile summary",done:true},{label:"2+ experience entries",done:true},{label:"Education",done:true},{label:"5+ skills",done:false,hint:"+15%"},{label:"Photo",done:false,hint:"+10%"}]})
""")

comp("TemplatePicker", "CV builder", 130, """
Choose a CV layout from miniature page thumbnails (Modern with a sidebar, Classic, Compact). A radio group.
""", """
  templates?: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  label?: string;
  onChange?: (v: string) => void;
""", """
h(M.TemplatePicker,null)
""")

comp("CvPreview", "CV builder", 760, """
The rendered CV on an A4 page. The paper always uses print colours (white, carbon text) whatever the UI theme; `accent` tints headings, rules and skill marks. Templates: `modern` (sidebar with lime rail), `classic`, `compact`. Print with the page's print styles or render to PDF server-side.
""", """
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
""", """
(function(){var t=React.useState("modern");return h("div",{className:"mh-stack",style:{gap:12,maxWidth:540}},h(M.TemplatePicker,{value:t[0],onChange:t[1]}),h(M.CvPreview,{template:t[0]}))})()
""")

comp("CvBuilderPage", "Pages", 1100, """
The full CV builder: top bar (save state, theme toggle, Preview, Download PDF), the editor on the left (CompletenessMeter, SectionEditors with PhotoUpload, PhoneInput, RepeatableList, TagInput) and the live CvPreview on the right with TemplatePicker and SwatchPicker. Edits update the paper as you type.
""", """
  persistTheme?: boolean;
""", """
h(M.CvBuilderPage,{persistTheme:false})
""")
