import { useEffect, useMemo, useState } from 'react'
import { Award, BookOpen, CreditCard, FileBadge, GraduationCap, Plus, Search, Settings, ShieldCheck, Users } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchList, type FrappeRow } from '../../../../api/frappe'
import { InvoiceTable } from '../dashboard/DashboardPage'

type Section = 'students'|'academics'|'registration'|'finance'|'results'|'transcripts'|'clearance'|'settings'
type SectionConfig = { eyebrow:string; title:string; description:string; doctype:string; fields:string[]; icon:typeof Users; columns:Array<[string,string]> }

const config: Record<Section,SectionConfig> = {
  students:{eyebrow:'ADMISSIONS & RECORDS',title:'Student Records',description:'Manage student identity, admission status, programme enrolment and cohort membership.',doctype:'Student',fields:['name','student_name','student_number','status','student_email_id'],icon:Users,columns:[['student_name','Student'],['student_number','Student Number'],['status','Status'],['student_email_id','Email']]},
  academics:{eyebrow:'ACADEMIC STRUCTURE',title:'Programmes And Courses',description:'Organise academic units, programmes, curricula and course catalogues.',doctype:'Academic Programme',fields:['name','programme_name','programme_code','academic_unit','status'],icon:GraduationCap,columns:[['programme_code','Code'],['programme_name','Programme'],['academic_unit','Academic Unit'],['status','Status']]},
  registration:{eyebrow:'SEMESTER OPERATIONS',title:'Course Registration',description:'Monitor semester registration, course offerings, cohort allocation and individual course choices.',doctype:'Course Registration',fields:['name','student','course_offering','registration_type','status'],icon:BookOpen,columns:[['student','Student'],['course_offering','Course Offering'],['registration_type','Type'],['status','Status']]},
  finance:{eyebrow:'STUDENT FINANCE',title:'Fees And Payments',description:'Monitor tuition invoices, payments, carried-forward balances and reconciliation in ERPNext Accounts.',doctype:'Sales Invoice',fields:['name','student','customer','academic_semester','grand_total','outstanding_amount','status'],icon:CreditCard,columns:[]},
  results:{eyebrow:'ASSESSMENT GOVERNANCE',title:'Results And Approval',description:'Review course results, retakes, incomplete grades and approval readiness.',doctype:'Student Course Result',fields:['name','student','course','total_mark','letter_grade','result_status','approval_status'],icon:Award,columns:[['student','Student'],['course','Course'],['total_mark','Mark'],['letter_grade','Grade'],['result_status','Result'],['approval_status','Approval']]},
  transcripts:{eyebrow:'REGISTRAR SERVICES',title:'Academic Transcripts',description:'Prepare, approve and issue controlled provisional and official transcripts.',doctype:'Academic Transcript',fields:['name','student','academic_programme','transcript_type','status','registrar_issued_on'],icon:FileBadge,columns:[['student','Student'],['academic_programme','Programme'],['transcript_type','Type'],['status','Status'],['registrar_issued_on','Issued']]},
  clearance:{eyebrow:'GOVERNANCE & CLEARANCE',title:'Student Clearance',description:'Confirm financial, academic and administrative clearance before graduation or exit.',doctype:'Student Clearance',fields:['name','student','clearance_type','financial_status','academic_status','status'],icon:ShieldCheck,columns:[['student','Student'],['clearance_type','Type'],['financial_status','Finance'],['academic_status','Academic'],['status','Status']]},
  settings:{eyebrow:'UNIVERSITY CONFIGURATION',title:'University Settings',description:'Review institution defaults, academic controls, accounts and document governance.',doctype:'University Education Settings',fields:['name','default_company','default_academic_year','default_grading_scheme'],icon:Settings,columns:[['default_company','Company'],['default_academic_year','Academic Year'],['default_grading_scheme','Grading Scheme']]},
}

export function RecordsPage({section}:{section:Section}) {
  const item=config[section]
  const Icon=item.icon
  const navigate=useNavigate()
  const [searchParams,setSearchParams]=useSearchParams()
  const [rows,setRows]=useState<FrappeRow[]>([])
  const [query,setQuery]=useState(searchParams.get('q')??'')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    setLoading(true)
    fetchList(item.doctype,item.fields,undefined,500).then(setRows).catch(()=>setRows([])).finally(()=>setLoading(false))
  },[item])
  useEffect(()=>setQuery(searchParams.get('q')??''),[searchParams])

  const filtered=useMemo(()=>rows.filter(row=>!query||JSON.stringify(row).toLowerCase().includes(query.toLowerCase())),[rows,query])
  const hasTranscriptAction=section==='transcripts'
  const columnCount=item.columns.length+(hasTranscriptAction?1:0)

  return <section className="records-page">
    <div className="page-intro"><div><span className="eyebrow">{item.eyebrow}</span><h1><Icon size={28}/>{item.title}</h1><p>{item.description}</p></div><button className="primary-button"><Plus size={16}/>Create record</button></div>
    <div className="records-summary card"><span className="records-summary-icon"><Icon size={24}/></span><div><strong>{rows.length}</strong><span>{item.doctype} records available</span></div><span className="source-chip">Live ERPNext data</span></div>
    <article className="card records-table-card">
      <div className="table-toolbar"><div><h3>{item.title}</h3><p>Search and review the latest records.</p></div><label className="search-input"><Search size={16}/><input value={query} onChange={event=>{const next=event.target.value;setQuery(next);setSearchParams(next?{q:next}:{},{replace:true})}} placeholder={`Search ${item.title.toLowerCase()}`} /></label></div>
      {section==='finance'?<InvoiceTable rows={filtered}/>:<div className="table-wrap"><table className="data-table">
        <thead><tr>{item.columns.map(column=><th key={column[0]}>{column[1]}</th>)}{hasTranscriptAction?<th>Action</th>:null}</tr></thead>
        <tbody>{loading?<tr><td colSpan={columnCount} className="data-table-empty">Loading records…</td></tr>:filtered.length?filtered.map((row,index)=><tr key={String(row.name??index)}>{item.columns.map(([field])=><td key={field}>{field==='status'||field.includes('approval')?<span className="status-pill tone-green">{String(row[field]??'—')}</span>:<>{field===item.columns[0][0]?<strong>{String(row[field]??row.name??'—')}</strong>:String(row[field]??'—')}</>}</td>)}{hasTranscriptAction?<td><button className="mini-action-button" type="button" onClick={()=>navigate(`/transcripts/view/${encodeURIComponent(String(row.name))}`)}>View transcript</button></td>:null}</tr>):<tr><td colSpan={columnCount} className="data-table-empty">No matching records found.</td></tr>}</tbody>
      </table></div>}
    </article>
  </section>
}
