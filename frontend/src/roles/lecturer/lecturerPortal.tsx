import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { callMethod, type FrappeRow } from '../../api/frappe'
import { useUrlScope } from '../../hooks/useUrlScope'

export type LecturerPortalData={lecturer:FrappeRow;offerings:FrappeRow[];registrations:FrappeRow[];students:FrappeRow[];timetable:FrappeRow[];assessments:FrappeRow[];attendance:FrappeRow[];results:FrappeRow[];review_requests:FrappeRow[];approval_batches:FrappeRow[]}
export type LecturerScope={offering:string;semester:string;query:string;page:number;pageSize:25|50|100|2000}
type LecturerPortalState={data:LecturerPortalData|null;allData:LecturerPortalData|null;scope:LecturerScope;setScope:(patch:Partial<LecturerScope>)=>void;loading:boolean;error:string;refresh:()=>void}
const LecturerPortalContext=createContext<LecturerPortalState|null>(null)
const method='ugandan_university_education.ugandan_university_education.api.get_lecturer_portal_data'
const initialScope:LecturerScope={offering:'',semester:'',query:'',page:1,pageSize:50}

function scoped(data:LecturerPortalData,scope:LecturerScope):LecturerPortalData{
  const matches=(row:FrappeRow)=>!scope.query||JSON.stringify(row).toLowerCase().includes(scope.query.toLowerCase())
  const baseOfferings=data.offerings.filter(row=>(!scope.offering||String(row.name)===scope.offering)&&(!scope.semester||String(row.academic_semester)===scope.semester)),offerings=baseOfferings.filter(matches)
  const offeringIds=new Set(baseOfferings.map(row=>String(row.name))), allOfferings=!scope.offering&&!scope.semester
  const registrations=data.registrations.filter(row=>(allOfferings||offeringIds.has(String(row.course_offering)))&&matches(row))
  const registrationIds=new Set(registrations.map(row=>String(row.name))), studentIds=new Set(registrations.map(row=>String(row.student)))
  const slice=<T,>(rows:T[])=>rows.slice((scope.page-1)*scope.pageSize,scope.page*scope.pageSize)
  return {...data,offerings,registrations:slice(registrations),students:slice(data.students.filter(row=>studentIds.has(String(row.name))&&matches(row))),timetable:slice(data.timetable.filter(row=>(allOfferings||offeringIds.has(String(row.course_offering)))&&matches(row))),assessments:slice(data.assessments.filter(row=>(allOfferings||offeringIds.has(String(row.course_offering)))&&matches(row))),attendance:slice(data.attendance.filter(row=>registrationIds.has(String(row.course_registration))&&matches(row))),results:slice(data.results.filter(row=>registrationIds.has(String(row.course_registration))&&matches(row))),review_requests:slice(data.review_requests.filter(matches)),approval_batches:slice(data.approval_batches.filter(row=>(allOfferings||offeringIds.has(String(row.course_offering)))&&matches(row)))}
}

export function LecturerPortalProvider({children}:{children:ReactNode}){
  const[allData,setAllData]=useState<LecturerPortalData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[scopeState,setUrlScope]=useUrlScope(initialScope)
  function refresh(){setLoading(true);setError('');callMethod<LecturerPortalData>(method).then(setAllData).catch(cause=>setError(cause instanceof Error?cause.message:'Unable to load the lecturer workspace.')).finally(()=>setLoading(false))}
  function setScope(patch:Partial<LecturerScope>){setUrlScope({...patch,page:patch.page??1})}
  useEffect(refresh,[])
  const data=useMemo(()=>allData?scoped(allData,scopeState):null,[allData,scopeState])
  return <LecturerPortalContext.Provider value={{data,allData,scope:scopeState,setScope,loading,error,refresh}}>{children}</LecturerPortalContext.Provider>
}
export function useLecturerPortal(){const value=useContext(LecturerPortalContext);if(!value)throw new Error('useLecturerPortal must be used inside LecturerPortalProvider');return value}
