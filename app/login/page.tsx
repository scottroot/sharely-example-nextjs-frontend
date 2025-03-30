"use client";
import {useEffect, useState} from "react";
import ReactMarkdown from "react-markdown";
import clsx from "clsx";


function SaveIcon(props: any) {
  return (
    <svg {...props} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m3-10H5V5h10z"/>
    </svg>
  )
}

function EditIcon(props: any) {
  return (
    <svg {...props} focusable="false" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"></path>
    </svg>
  )
}

function CustomerNameInput(
  {value, setValue, savedValue, setSavedValue, isEditing, setIsEditing, loaded}:
    { value: any, setValue: any, savedValue: any, setSavedValue: any, isEditing: any, setIsEditing: any, loaded: boolean }
) {

  const handleSave = async () => {
    setSavedValue(value);
    setIsEditing(false);
    await fetch("/api/account", {method: "POST", body: JSON.stringify({account: value})})
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="max-w-sm space-y-1 mb-10">
      <label className="block text-sm font-light text-gray-500">
        Account Name
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className={clsx(
            "flex-1 rounded-sm border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
            isEditing ? "border-gray-300 bg-white text-gray-900" : "border-gray-200 bg-gray-100 text-gray-500",
            !loaded ? "animate-pulse" : "",
          )}
          value={isEditing ? value : savedValue}
          onChange={(e) => setValue(e.target.value)}
          disabled={!isEditing || !loaded}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        {isEditing ? (
          <button
            onClick={handleSave}
            className="group inline-flex aspect-square items-center rounded-lg bg-green-800 p-1 hover:opacity-75 cursor-pointer"
          >
            <SaveIcon className="size-5 mr-1 fill-white group-hover:fill-white/75" />
          </button>
        ) : (
          <button
            onClick={handleEdit}
            className="inline-flex aspect-square items-center rounded-lg bg-gray-600 p-1 hover:opacity-75 cursor-pointer"
          >
            <EditIcon className="size-5 mr-1 fill-white group-hover:fill-white/75" />
          </button>
        )}
      </div>
    </div>
  );
}


export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState("");
  const [savedValue, setSavedValue] = useState("");
  const [isEditing, setIsEditing] = useState(true);


  useEffect(() => {
    (async () => {
      const res = await fetch("/api/account")
      const { account } = await res.json();
      if(account) setValue(account)
      setLoaded(true)
    })()
  }, [])

  return (
    <div className="max-w-2xl mx-auto my-10 p-4 border border-gray-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <CustomerNameInput
        value={value} setValue={setValue}
        savedValue={savedValue} setSavedValue={setSavedValue}
        isEditing={isEditing} setIsEditing={setIsEditing}
        loaded={loaded}
      />
    </div>
  );
}
