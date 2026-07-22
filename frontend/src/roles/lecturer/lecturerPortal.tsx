import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { callMethod, type FrappeRow } from '../../api/frappe'

export type LecturerPortalData={lecturer:FrappeRow;offerings:FrappeRow[];registrations:FrappeRow[];students:FrappeRow[];timetable:FrappeRow[];assessments:FrappeRow[];attendance:FrappeRow[];results:FrappeRow[];review_requests:FrappeRow[];approval_batches:FrappeRow[]}
type LecturerPortalState={data:LecturerPortalData|null;loading:boolean;error:string;refresh:()=>void}
const LecturerPortalContext=createContext<LecturerPortalState|null>(null)
const method='ugandan_university_education.ugandan_university_education.api.get_lecturer_portal_data'

export function LecturerPortalProvider({children}:{children:ReactNode}){const[data,setData]=useState<LecturerPortalData|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');function refresh(){setLoading(true);setError('');callMethod<LecturerPortalData>(method).then(setData).catch(cause=>setError(cause instanceof Error?cause.message:'Unable to load the lecturer workspace.')).finally(()=>setLoading(false))}useEffect(refresh,[]);return <LecturerPortalContext.Provider value={{data,loading,error,refresh}}>{children}</LecturerPortalContext.Provider>}
export function useLecturerPortal(){const value=useContext(LecturerPortalContext);if(!value)throw new Error('useLecturerPortal must be used inside LecturerPortalProvider');return value}
