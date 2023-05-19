import type { ActionArgs, ActionFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "~/db.server";

export const action: ActionFunction = async ({ request }: ActionArgs) => {
    const formData = await request.formData();
    
    const operation = formData.get("operation") as string;

    if(operation === 'create') {
        const title = formData.get("title") as string;
        const body = formData.get("body") as string;

        await prisma.note.create({
            data: { 
                title: title,
                body
            }
        })
    } else if(operation === 'delete') {
        const id = formData.get("id") as string;

        await prisma.note.delete({
            where: { 
                id: id 
            }
        })
    }  else if(operation === 'update') {
        const id = formData.get("id") as string;

        const title = formData.get("title") as string;
        const body = formData.get("body") as string;

        await prisma.note.update({
            where: { 
                id: id 
            },
            data: {
                title: title,
                body: body
            }
        })
    }
    
    return redirect('/')
}

export async function loader({ request }: any) {
    const notes = await prisma.note.findMany()
    return { notes }
}

export default function Home () {

    const { notes } = useLoaderData<typeof loader>();
    const [modifyNote, setModifyNote] = useState<{title: string, body: string, id?: string}>({title: '', body: '', id: undefined});

    const handleInputChange = (event: any) => {
        setModifyNote((prevValues) => ({...prevValues,[event.target.name]: event.target.value }));
    };

    return (
        <div className="mt-14 p-3 sm:mx-auto sm:w-full sm:max-w-sm">
            
            {/* Criação e atualização */}
            <Form action="" method="post">
                <h2 className="mt-10 text-center text-2xl font-bold text-gray-900">
                    Criar nova nota
                </h2>

                <input
                    className="border rounded w-full py-2 px-3 text-gray-700"
                    type="text"
                    placeholder="Title"
                    name="title"
                    value={modifyNote.title}
                    onChange={handleInputChange}
                />
                        
                <input
                    className="border mt-3 rounded w-full py-2 px-3 text-gray-700"
                    type="text"
                    placeholder="Body"
                    name="body"
                    value={modifyNote.body}
                    onChange={handleInputChange}
                />
                {/* {modifyNote.id ? 'update' : 'create'} */}
                { modifyNote.id && <input type="hidden" name="id" value={modifyNote.id} />}
                <input type="hidden" name="operation" value={modifyNote.id ? 'update' : 'create'} />

                { modifyNote.id && 
                    <button onClick={()=>{
                        setModifyNote({title: '', body:'', id: undefined})
                    }} type="submit" className={`flex w-full mt-3 justify-center rounded-md bg-gray-600 px-3 py-1.5 text-white`}>
                        Cancelar modificação
                    </button>
                }
                <button type="submit" className={`flex w-full mt-3 justify-center rounded-md ${modifyNote.id ? 'bg-indigo-600' : 'bg-green-600'} px-3 py-1.5 text-white`}>{modifyNote.id ? 'Atualizar' : 'Criar'}</button>
            </Form>

            {notes.length === 0 &&
                <div className="pt-5">
                    Nenhuma nota cadastrada.
                </div>
            }

            {/* Listagem */}
            {notes.map((note, index)=>
                <div key={index} className="flex">
                    
                    
                    <div className="flex flex-col bg-gray-200 w-full p-2 mt-2">
                        <div className="flex flex-col">
                            <div className="flex justify-end">
                                
                                <button
                                    onClick={()=>setModifyNote(note)}
                                    className="pr-2 hover:text-blue-900 text-blue-500 cursor-pointer"
                                >
                                    Modificar
                                </button>
                            
                                <div>
                                    <Form action="" method="post">
                                        <input type="hidden" name="operation" value="delete" />
                                        <input type="hidden" name="id" value={note.id} />
                                        <button
                                            type="submit"
                                            className="pr-2 hover:text-red-900 text-red-500 cursor-pointer"
                                        >
                                            Remover
                                        </button>
                                    </Form>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="mt-2 text-sm font-semibold text-gray-800">{note.title}</h3>
                            </div>
                        </div>
                        {note.body}
                    </div>
                    
                </div>
            )}
        </div>
    )
}





