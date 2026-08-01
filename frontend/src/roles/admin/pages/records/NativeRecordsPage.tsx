import { Award, BookOpen, CalendarDays, ClipboardCheck, FileBadge, FileText, GraduationCap, UserRoundCheck, Users, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchAdminAcademicPage, fetchListPage, type FrappeRow, type ListFilter, type ListPageQuery } from '../../../../api/frappe'
import { DataWorkbench, type DataWorkbenchSchema, type WorkbenchAction, type WorkbenchColumn } from '../../../../components/DataWorkbench'
import { AdminRecordDrawer, CreateRecordButton, supportsNativeForm } from './AdminLifecycle'
import { GuidedRecordFormModal as RecordFormModal } from './GuidedRecordFormModal'
import { recordViewConfig, type RecordView } from './RecordsPage'

const importableViews: RecordView[] = ['students','applications','programmes','cohorts','courses','enrolments']
const academicViews:RecordView[]=['programmes','courses','units','curricula','cohorts','offerings']
const relationalFilters={faculty_unit:{field:'faculty_unit',label:'Faculty / Academic unit'},academic_programme:{field:'academic_programme',label:'Programme'},academic_year:{field:'academic_year',label:'Academic year'},semester:{field:'semester',label:'Semester'},cohort:{field:'cohort',label:'Cohort'},lecturer:{field:'lecturer',label:'Lecturer'}} as const
function academicFilterFields(view:RecordView){const map:Partial<Record<RecordView,(keyof typeof relationalFilters)[]>>={programmes:['faculty_unit'],courses:['faculty_unit'],curricula:['faculty_unit','academic_programme','academic_year'],cohorts:['faculty_unit','academic_programme','academic_year'],offerings:['faculty_unit','academic_programme','academic_year','semester','cohort','lecturer']};return map[view]?.map(key=>relationalFilters[key])}

function statusFilter(view:RecordView,subtab:string|null):ListFilter[]{
  if(!subtab||subtab==='all'||subtab==='saved-views')return []
  if(view==='applications'){const value:{[key:string]:string}={'draft':'Draft','under-review':'Under Review','admitted':'Accepted','rejected':'Rejected'};return value[subtab]?[{field:'status',operator:'=',value:value[subtab]}]:[]}
  if(view==='students'){const value:{[key:string]:string}={'active':'Active','on-leave':'On Leave','completed':'Completed','withdrawn':'Withdrawn'};return value[subtab]?[{field:'status',operator:'=',value:value[subtab]}]:[]}
  if(subtab==='active')return [{field:'status',operator:'=',value:'Active'}]
  if(subtab==='archived')return [{field:'status',operator:'in',value:'Archived,Inactive'}]
  if(subtab==='draft')return [{field:'status',operator:'=',value:'Draft'}]
  if(subtab==='approved')return [{field:'status',operator:'=',value:'Approved'}]
  if(subtab==='issued')return [{field:'status',operator:'=',value:'Registrar Issued'}]
  if(subtab==='revoked')return [{field:'status',operator:'=',value:'Revoked'}]
  if(subtab==='cleared')return [{field:'status',operator:'=',value:'Cleared'}]
  if(subtab==='outstanding')return [{field:'status',operator:'!=',value:'Cleared'}]
  return []
}

export function NativeRecordsPage({ view }: { view: RecordView }) {
  const item = recordViewConfig[view], Icon = item.icon, navigate = useNavigate(), [params,setParams]=useSearchParams()
  const [editing,setEditing]=useState<FrappeRow|null>(null), [formOpen,setFormOpen]=useState(params.get('create')!==null)
  const sourceColumns = item.invoiceTable ? [['student','Student'],['academic_semester','Semester'],['grand_total','Total'],['outstanding_amount','Outstanding'],['status','Status']] as Array<[string,string]> : item.columns
  const columns: WorkbenchColumn[] = sourceColumns.map(([field,label]) => ({ field, label, render: field === 'status' || field.startsWith('is_') || field.includes('_status') ? value => <span className="status-pill tone-green">{String(value ?? '—')}</span> : undefined }))
  const schema: DataWorkbenchSchema = {
    entity: item.doctype, title: item.title, description: item.description, columns,
    searchFields: item.fields.filter(field => ['name','student','student_name','student_number','applicant_name','application_number','programme_code','programme_name','cohort_code','cohort_name','course','academic_programme','academic_year','student_cohort','academic_semester','lecturer','status'].includes(field)).slice(0,8),
    defaultSort: 'modified', allowImport: importableViews.includes(view),
    filterFields: academicFilterFields(view),
    quickFilters: item.fields.includes('status') ? [{label:'Active',field:'status',value:'Active'},{label:'Draft',field:'status',value:'Draft'},{label:'Completed',field:'status',value:'Completed'}] : undefined,
  }
  async function loadPage(query: ListPageQuery, signal?: AbortSignal) { const fixed:ListFilter[] = view === 'readiness' ? [{field:'clearance_type',operator:'=',value:'Graduation'}] : statusFilter(view,params.get('subtab')); const merged={...query,filters:[...fixed,...(query.filters??[])]}; return academicViews.includes(view)?fetchAdminAcademicPage(item.doctype,item.fields,merged):fetchListPage(item.doctype,item.fields,merged,signal) }
  function actionsFor(row:FrappeRow):WorkbenchAction[]{const student=String(view==='students'?row.name??'':row.student??''),value=(field:string)=>encodeURIComponent(String(row[field]??row.name??'')),actions:WorkbenchAction[]=[];if(student){actions.push({label:'Profile',icon:UserRoundCheck,onSelect:()=>navigate(`/students/profile/${encodeURIComponent(student)}`)},{label:'Transcript',icon:FileText,onSelect:()=>navigate(`/transcripts?student=${encodeURIComponent(student)}`)},{label:'Finance',icon:WalletCards,onSelect:()=>navigate(`/finance/analysis?student=${encodeURIComponent(student)}`)})}else if(view==='programmes'){actions.push({label:'Cohorts',icon:Users,onSelect:()=>navigate(`/students/cohorts?q=${value('name')}`)},{label:'Offerings',icon:BookOpen,onSelect:()=>navigate(`/registration/offerings?q=${value('name')}`)})}else if(view==='courses'){actions.push({label:'Offerings',icon:BookOpen,onSelect:()=>navigate(`/registration/offerings?q=${value('name')}`)},{label:'Results',icon:Award,onSelect:()=>navigate(`/results?q=${value('name')}`)})}else if(view==='cohorts'){actions.push({label:'Add student',icon:Users,onSelect:()=>{setParams(current=>{const next=new URLSearchParams(current);next.set('create','student');next.set('cohort',String(row.name));return next});setFormOpen(true)}},{label:'Enrolments',icon:GraduationCap,onSelect:()=>navigate(`/students/enrolments?q=${value('name')}`)})}else if(['calendar','semesters','academic-years'].includes(view)){actions.push({label:'Registrations',icon:CalendarDays,onSelect:()=>navigate(`/registration?q=${value('name')}`)},{label:'Results',icon:Award,onSelect:()=>navigate(`/results?q=${value('name')}`)})}else if(view==='fee-structures'){actions.push({label:'Invoices',icon:FileBadge,onSelect:()=>navigate(`/finance/invoices?q=${value('academic_semester')}`)})}return actions.slice(0,3)}
  function closeForm(){setFormOpen(false);setEditing(null);setParams(current=>{const next=new URLSearchParams(current);next.delete('create');next.delete('cohort');return next},{replace:true})}
  function refresh(){setParams(current=>{const next=new URLSearchParams(current);next.set('refresh',String(Date.now()));return next},{replace:true})}
  const defaults:FrappeRow=view==='students'&&params.get('cohort')?{status:'Active',student_cohort:params.get('cohort')}:{ }
  return <section className="records-page"><div className="page-intro"><div><span className="eyebrow">{item.eyebrow}</span><h1><Icon size={28}/>{item.title}</h1><p>{item.description}</p></div></div><div className="records-summary card"><span className="records-summary-icon"><Icon size={24}/></span><div><strong>50</strong><span>default rows per page · maximum 2,000</span></div><span className="source-chip">Native paginated data</span></div><DataWorkbench schema={schema} loadPage={loadPage} actions={actionsFor} primaryAction={supportsNativeForm(view)?<CreateRecordButton label={`Add ${view==='students'?'student':view==='applications'?'application':'record'}`} onClick={()=>setFormOpen(true)}/>:undefined} renderDrawer={(row,close)=><AdminRecordDrawer view={view} doctype={item.doctype} columns={columns} row={row} onClose={close} onEdit={supportsNativeForm(view)?()=>{setEditing(row);setFormOpen(true);close()}:undefined}/>}/>{formOpen&&supportsNativeForm(view)?<RecordFormModal view={view} doctype={item.doctype} record={editing} defaults={defaults} onClose={closeForm} onSaved={refresh}/>:null}{academicViews.includes(view)?<p className="native-governance-note"><ClipboardCheck size={15}/>Create and update requests are validated by ERPNext permissions; workflow transitions use guarded University API methods and are recorded in the activity timeline.</p>:null}</section>
}
