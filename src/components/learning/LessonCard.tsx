import { ArrowRight, BookOpen, Check } from 'lucide-react';
import type { Lesson } from '../../types/lesson';

export default function LessonCard({lesson,done,onOpen}:{lesson:Lesson;done:boolean;onOpen:(l:Lesson)=>void}) {return <button className="lesson-card" onClick={()=>onOpen(lesson)}><div className="lesson-card-top"><span>{lesson.icon}</span><span className="tag">{done?'Completed':lesson.level}</span></div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="lesson-card-bottom"><span><BookOpen size={13}/>{lesson.duration}</span><span>{done?<Check size={15}/>:<ArrowRight size={15}/>}</span></div></button>}
