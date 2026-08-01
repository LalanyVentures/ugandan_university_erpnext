import { callMethod, fetchListPage, type FrappeRow, type ListFilter } from './frappe'
import type { PortalRole } from '../roles/admin/roleConfig'

export type ExplorerNodeKind = 'root' | 'group' | 'entity' | 'record'
export type ExplorerNode = { id: string; kind: ExplorerNodeKind; entity?: string; recordId?: string; label: string; metadata?: string; route?: string; createRoute?: string; expandable?: boolean; filters?: ListFilter[] }
export type DiscoveryResult = { id: string; group: 'Navigation' | 'Records' | 'Tree' | 'Actions' | 'Help'; kind: string; title: string; detail: string; route: string; treePath?: string }

const roleGroups: Record<PortalRole, string[]> = {
  administrator: ['students','academics','registration','finance','results','transcripts'],
  registrar: ['students','academics','registration','results','transcripts'],
  'faculty-head': ['students','academics','registration','results','transcripts'],
  lecturer: ['students','registration','results'],
  finance: ['students','finance'],
  student: ['registration','finance','results','transcripts'],
  staff: [],
}

const groups: Record<string, ExplorerNode> = {
  students:{id:'group:students',kind:'group',label:'Students and cohorts',metadata:'Student records',route:'/students',expandable:true},
  academics:{id:'group:academics',kind:'group',label:'Academic structure',metadata:'Programmes and courses',route:'/academics',expandable:true},
  registration:{id:'group:registration',kind:'group',label:'Teaching and registration',metadata:'Offerings and enrolments',route:'/registration',expandable:true},
  finance:{id:'group:finance',kind:'group',label:'Finance',metadata:'Invoices and payments',route:'/finance',expandable:true},
  results:{id:'group:results',kind:'group',label:'Results',metadata:'Marks and publication',route:'/results',expandable:true},
  transcripts:{id:'group:transcripts',kind:'group',label:'Transcripts',metadata:'Issued academic records',route:'/transcripts',expandable:true},
}

const entityDefinitions: Record<string, {label:string;doctype:string;fields:string[];title:string;detail:string;route:string;createRoute?:string}> = {
  Student:{label:'Students',doctype:'Student',fields:['name','student_name','student_number','status'],title:'student_name',detail:'student_number',route:'/students',createRoute:'/students?create=student'},
  Cohort:{label:'Cohorts',doctype:'Student Cohort',fields:['name','cohort_name','cohort_code','academic_programme','status'],title:'cohort_name',detail:'academic_programme',route:'/students/cohorts',createRoute:'/students/cohorts?create=cohort'},
  Programme:{label:'Programmes',doctype:'Academic Programme',fields:['name','programme_name','programme_code','status'],title:'programme_name',detail:'programme_code',route:'/academics',createRoute:'/academics?create=programme'},
  Course:{label:'Courses',doctype:'Course',fields:['name','course_name','course_code','academic_unit','status'],title:'course_name',detail:'course_code',route:'/academics/courses',createRoute:'/academics/courses?create=course'},
  Offering:{label:'Course offerings',doctype:'Course Offering',fields:['name','course','academic_semester','student_cohort','status'],title:'course',detail:'academic_semester',route:'/registration/offerings',createRoute:'/registration/offerings?create=offering'},
  Enrolment:{label:'Programme enrolments',doctype:'Student Programme Enrolment',fields:['name','student','academic_programme','student_cohort','status'],title:'student',detail:'academic_programme',route:'/students/enrolments',createRoute:'/students/enrolments?create=enrolment'},
  Invoice:{label:'Student invoices',doctype:'Sales Invoice',fields:['name','student','customer','academic_semester','outstanding_amount','status'],title:'student',detail:'academic_semester',route:'/finance/invoices'},
  Result:{label:'Course results',doctype:'Student Course Result',fields:['name','student','course','academic_semester','grade','result_status'],title:'student',detail:'course',route:'/results'},
  Transcript:{label:'Transcripts',doctype:'Academic Transcript',fields:['name','student','academic_programme','status','verification_number'],title:'student',detail:'academic_programme',route:'/transcripts/register'},
}

const groupEntities: Record<string,string[]> = { students:['Cohort','Student'], academics:['Programme','Course'], registration:['Offering','Enrolment'], finance:['Invoice'], results:['Result'], transcripts:['Transcript'] }
const roleEntities: Record<PortalRole,string[]> = {
  administrator:Object.keys(entityDefinitions),
  registrar:['Student','Cohort','Programme','Course','Offering','Enrolment','Result','Transcript'],
  'faculty-head':[],
  lecturer:[],
  finance:['Student','Invoice'],
  student:[],
  staff:[],
}
export function explorerRoots(_role: PortalRole): ExplorerNode[] { return [{id:'university',kind:'root',label:'Ankole Western University',metadata:'University workspace',expandable:true}] }

type LecturerTreeData={offerings:FrappeRow[];registrations:FrappeRow[];students:FrappeRow[]}
let lecturerTreeRequest:Promise<LecturerTreeData>|null=null
function lecturerTreeData(){lecturerTreeRequest??=callMethod<LecturerTreeData>('ugandan_university_education.ugandan_university_education.api.get_lecturer_portal_data').catch(cause=>{lecturerTreeRequest=null;throw cause});return lecturerTreeRequest}

export async function loadExplorerChildren(node: ExplorerNode, role: PortalRole, signal?: AbortSignal): Promise<ExplorerNode[]> {
  if (node.kind === 'root' && role === 'lecturer') return [{id:'lecturer:offerings',kind:'group',label:'My Offerings',metadata:'Assigned teaching load',route:'/lecturer/offerings',expandable:true}]
  if (node.kind === 'root') return (roleGroups[role]??[]).map(id=>groups[id])
  if (role === 'lecturer' && node.id === 'lecturer:offerings') { const data=await lecturerTreeData(); return data.offerings.map(row=>({id:`lecturer:offering:${String(row.name)}`,kind:'record',entity:'Offering',recordId:String(row.name),label:String(row.course_name??row.course_code??row.course??row.name),metadata:`${String(row.academic_semester??'Semester')} · ${String(row.status??'Assigned')}`,route:`/lecturer/offerings?offering=${encodeURIComponent(String(row.name))}`,expandable:true})) }
  if (role === 'lecturer' && node.kind === 'record' && node.entity === 'Offering') { const data=await lecturerTreeData(); return data.registrations.filter(row=>String(row.course_offering)===String(node.recordId)).map(row=>({id:`lecturer:registration:${String(row.name)}`,kind:'record',entity:'Registration',recordId:String(row.name),label:String(row.student_name??row.student),metadata:`${String(row.student_number??row.student)} · ${String(row.status??'Registered')}`,route:`/lecturer/students?offering=${encodeURIComponent(String(node.recordId))}`,expandable:true})) }
  if (role === 'lecturer' && node.kind === 'record' && node.entity === 'Registration') { const data=await lecturerTreeData(),registration=data.registrations.find(row=>String(row.name)===String(node.recordId)),student=data.students.find(row=>String(row.name)===String(registration?.student)); return student?[{id:`lecturer:student:${String(student.name)}`,kind:'record',entity:'Student',recordId:String(student.name),label:String(student.student_name??student.name),metadata:String(student.student_number??student.status??''),route:'/lecturer/students',expandable:false}]:[] }
  if (node.kind === 'group') return (groupEntities[node.id.replace('group:','')]??[]).filter(entity=>roleEntities[role].includes(entity)).map(entity => { const definition=entityDefinitions[entity]; return {id:`entity:${entity}`,kind:'entity',entity,label:definition.label,metadata:definition.doctype,route:definition.route,createRoute:definition.createRoute,expandable:true} })
  if (node.kind === 'record' && node.entity === 'Cohort') { const definition=entityDefinitions.Enrolment; const result=await fetchListPage(definition.doctype,definition.fields,{pageSize:25,filters:[{field:'student_cohort',operator:'=',value:String(node.recordId)}],sortField:'modified'},signal); return result.rows.map(row=>recordNode('Enrolment',row)) }
  if (node.kind !== 'entity' || !node.entity || !entityDefinitions[node.entity] || !roleEntities[role].includes(node.entity)) return []
  const definition=entityDefinitions[node.entity], result=await fetchListPage(definition.doctype,definition.fields,{pageSize:25,filters:node.filters,sortField:'modified'},signal)
  return result.rows.map(row=>recordNode(node.entity!,row))
}

function recordNode(entity:string,row:FrappeRow):ExplorerNode { const definition=entityDefinitions[entity], recordId=String(row.name??''); return {id:`record:${entity}:${recordId}`,kind:'record',entity,recordId,label:String(row[definition.title]??recordId),metadata:[row[definition.detail],row.status??row.result_status].filter(Boolean).join(' · '),route:entity==='Student'?`/students/profile/${encodeURIComponent(recordId)}`:`${definition.route}?q=${encodeURIComponent(recordId)}&record=${encodeURIComponent(recordId)}&tree=${encodeURIComponent(`university/${entity}/${recordId}`)}`,expandable:entity==='Cohort'} }

const searchDefinitions = ['Student','Cohort','Programme','Course','Offering','Invoice','Result','Transcript']
export async function searchUniversity(query:string, role:PortalRole, signal?:AbortSignal):Promise<DiscoveryResult[]> { const allowedGroups=new Set(roleGroups[role]??[]), allowed=searchDefinitions.filter(entity=>roleEntities[role].includes(entity)&&Object.entries(groupEntities).some(([group,entities])=>allowedGroups.has(group)&&entities.includes(entity))); const settled=await Promise.allSettled(allowed.map(async entity=>{const definition=entityDefinitions[entity];const page=await fetchListPage(definition.doctype,definition.fields,{search:query,searchFields:definition.fields.slice(0,4),pageSize:25,sortField:'modified'},signal);return page.rows.slice(0,5).map(row=>{const node=recordNode(entity,row);return{id:node.id,group:'Records' as const,kind:entity,title:node.label,detail:node.metadata??definition.label,route:node.route??definition.route,treePath:`university/${entity}/${node.recordId}`}})})); const records=settled.flatMap(result=>result.status==='fulfilled'?result.value:[]); const tree=records.slice(0,5).map(record=>({...record,id:`tree:${record.id}`,group:'Tree' as const,detail:`Open in University hierarchy · ${record.detail}`})); const navigation=(roleGroups[role]??[]).map(id=>groups[id]).filter(node=>`${node.label} ${node.metadata}`.toLowerCase().includes(query.toLowerCase())).map(node=>({id:`nav:${node.id}`,group:'Navigation' as const,kind:'Section',title:node.label,detail:node.metadata??'',route:node.route??'/dashboard'})); const actions=(role==='administrator'&&'add new student'.includes(query.toLowerCase()))?[{id:'action:add-student',group:'Actions' as const,kind:'Action',title:'Add a student',detail:'Open the native student workspace',route:'/students?create=student'}]:[]; const help='filters export import pagination explorer'.includes(query.toLowerCase())?[{id:'help:workbench',group:'Help' as const,kind:'Help',title:'Using the Data Workbench',detail:'Search, filter, select, import and export records',route:'/students?help=workbench'}]:[]; return [...navigation,...records,...tree,...actions,...help].slice(0,30) }

export function auditDiscovery(event:'search'|'tree_open'|'tree_select'|'search_select',metadata:Record<string,unknown>={}) { const safe={event,queryLength:Number(metadata.queryLength??0),kind:String(metadata.kind??''),route:String(metadata.route??'').split('?')[0],at:new Date().toISOString()}; try{const key='awu-discovery-audit';const entries=JSON.parse(localStorage.getItem(key)??'[]');localStorage.setItem(key,JSON.stringify([...entries.slice(-99),safe]))}catch{} const match=window.location.pathname.match(/\/app-api\/apps\/([^/]+)\//);if(match)navigator.sendBeacon?.(`/app-api/apps/${encodeURIComponent(match[1])}/university/audit`,new Blob([JSON.stringify(safe)],{type:'application/json'})) }
