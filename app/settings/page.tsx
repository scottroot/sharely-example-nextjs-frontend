"use client"
import clsx from "clsx";
import {EditIcon, SaveIcon} from "@/app/icons";
import {State, useHookstate} from "@hookstate/core";
import { useAccount, AccountIsLoading, AccountNotLoggedIn } from "@/lib/useAccount";
import {ChevronDoubleDownIcon, ChevronUpIcon} from "@heroicons/react/24/solid";
import {useEffect, useRef} from "react";

type BaseCategory = {
  inputValue: string;
  name: string;
  isEditing: boolean;
  isLoading: boolean;
  expanded: boolean;
}
type Subcategory = Omit<Category, "subcategories">;
type Category = BaseCategory & {subcategories: Subcategory[]}

const defaultCategoryState: Category = {
  inputValue: "",
  name: "",
  isEditing: false,
  isLoading: false,
  expanded: false,
  subcategories: [],
}


interface SubItemProps {
  subcategoryState: State<Subcategory>;
  category: string;
  handleSubcategoryUpload?: any;
}

function SubItem({subcategoryState, category, handleSubcategoryUpload}: SubItemProps) {
  const state = useHookstate(subcategoryState);

  const handleSaveSub = async () => {
    if (state.promised) return;
    if (state.name.value === state.inputValue.value) {
      state.isEditing.set(false);
      return;
    }
    const originalName = state.name.value;

    state.merge({
      isLoading: true,
      isEditing: false,
      name: JSON.parse(JSON.stringify(state.inputValue.value))
    });

    const res = await fetch("/api/account/top-10", {
      method: "POST",
      body: JSON.stringify({category, name: state.name.value, originalName})
    });

    if(!res.ok) console.error(`Error saving change to category: ${await res.text}`)

    // await state.promise?.then(s => s.isLoading.set(false));
    if(state.promised) await state.promise?.then(s => s.isLoading.set(false));
    else state.isLoading.set(false)
    console.log("Done sub item save...");

    return;
  };

  return (
    <li key={state.name.value} className="flex pl-4 items-center space-x-2">
      <div className="group relative inline-flex flex-row items-center w-3/4 bg-gray-100 px-3 py-1">
        <div
          className={clsx(!state.isEditing.value ? "absolute -inset-1 cursor-pointer" : "hidden")}
          onClick={() => !state.isEditing.value ? state.isEditing.set(true) : null}
        />
        <input
          type="text"
          className={clsx(
            "w-full flex-1 rounded-sm border-none py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium",
            state.isEditing.value ? "outline-1 outline-gray-300 bg-white text-gray-900 px-3" : "border-none px-3",
            state.isLoading.value ? "animate-pulse" : "",
          )}
          value={(state.isEditing.value ? state.inputValue.value : state.name.value) || ""}
          onChange={(e) => state.inputValue.set(e.target.value)}
          disabled={!state.isEditing.value || state.isLoading.value}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSaveSub();
            }
          }}
        />
        {state.isEditing.value
          ? <button
              onClick={handleSaveSub}
              className="group inline-flex size-6 p-1 justify-center items-center rounded-lg bg-green-800 cursor-pointer"
            >
              <SaveIcon className="size-5 fill-white group-hover:fill-white/75" />
            </button>
          : <button
              onClick={() => state.isEditing.set(true)}
              className="group inline-flex size-6 justify-center items-center cursor-pointer"
            >
              <EditIcon className="opacity-0 group-hover:opacity-100 transition-opacity size-5 fill-gray-500 group-hover:fill-gray-700" />
            </button>
        }
      </div>
    </li>
  )
}


function Item({categoryState, idx, handleUpload}:
  { categoryState: State<Category>, idx: number, handleUpload: (i: number, name: string) => Promise<void> }
) {
  const state = useHookstate(categoryState); // scoped state...
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.isEditing.value) inputRef.current?.focus();
  }, [state.isEditing.value]);

  if (state.promised) return null;

  const handleSave = async () => {
    if (state.promised) return;
    if (state.name.value === state.inputValue.value) {
      state.isEditing.set(false);
      return;
    }
    const originalName = state.name.value;

    state.merge({
      isLoading: true,
      isEditing: false,
      name: JSON.parse(JSON.stringify(state.inputValue.value))
    });

    const res = await fetch("/api/account/top-10", {
      method: "POST",
      body: JSON.stringify({idx, name: state.name.value, originalName})
    });

    if(!res.ok) console.error(`Error saving change to category: ${await res.text}`)

    if(state.promised) await state.promise?.then(s => s.isLoading.set(false));
    else state.isLoading.set(false)

    return;
  };

  return (
    <div className="w-xl flex flex-col mb-4 items-start border rounded-lg py-2 pr-2">
      <div className="group relative inline-flex w-full pl-4 items-center space-x-2">
        <div
          className={clsx(!state.isEditing.value ? "absolute -inset-1 cursor-pointer" : "hidden")}
          onClick={() => {
            state.isEditing.set(true);
            inputRef.current?.focus();
          }}
        />
        <input
          type="text"
          ref={inputRef}
          className={clsx(
            "min-w-fit flex-1 rounded-sm border-none py-1.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold",
            state.isEditing.value ? "outline-1 outline-gray-300 bg-white text-gray-900 px-3" : "outline-1 outline-gray-500 border-none px-3",
            state.isLoading.value ? "animate-pulse" : "",
          )}
          value={(state.isEditing.value ? state.inputValue.value : state.name.value) || ""}
          onChange={(e) => state.inputValue.set(e.target.value)}
          disabled={!state.isEditing.value || state.isLoading.value}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          onClick={() => !state.isEditing.value ? state.isEditing.set(true) : null}
        />
        {state.isEditing.value
          ? <button
              onClick={handleSave}
              className="group inline-flex size-6 p-1 justify-center items-center rounded-lg bg-green-800 cursor-pointer"
            >
              <SaveIcon className="size-5 fill-white group-hover:fill-white/75" />
            </button>
          : <button
              onClick={() => state.isEditing.set(true)}
              className="group inline-flex size-6 justify-center items-center cursor-pointer"
            >
              <EditIcon className="opacity-0 group-hover:opacity-100 transition-opacity size-5 fill-gray-500 group-hover:fill-gray-700" />
            </button>
        }
      </div>
      {/*{JSON.stringify(state.subcategories.value)}*/}
      {(state.expanded.value && state.subcategories.value) &&
        <ul className="w-full pr-3">
          {state.subcategories.map((substate, sub_i) => (
            <SubItem
              key={`subcategory_${sub_i}`}
              subcategoryState={substate}
              // handleSubcategoryUpload={handleSubcategoryUpload}
              handleSubcategoryUpload={null}
              category={state.name.value}
            />
          ))}
          {(!state.subcategories.value || !state.subcategories.length) &&
            <li className="">Category &#34;{state.name.value}&#34; does not yet have any subcategories.</li>
          }
        </ul>
      }
      <button
        className="flex items-center ml-4 mt-2 cursor-pointer text-gray-700 text-sm bg-gray-100  rounded-full px-3 py-0.5"
        onClick={() => state.expanded.set(p => !p)}
      >
        {state.expanded.value
          ? <>Hide subcategories <ChevronUpIcon className="ml-2 size-3" /></>
          : <>Expand subcategories ({state.subcategories.length}) <ChevronDoubleDownIcon className="ml-2 size-3" /></>
        }
      </button>
    </div>
  )
}


async function fetchCategories(account: string, revalidate: boolean = false): Promise<Category[]> {
  const response = await fetch(`/api/account/top-10?account=${account}`, {
    // cache: revalidate ? "no-cache" : "force-cache"
  });
  if(response?.ok) {
    const data: {category: string, subcategories: string[]}[] = await response.json().then(r => r.rootCategories);
    if(data.length) {
      const categoriesData = data.map(d => {
        const subs = d.subcategories.map(s => ({ ...defaultCategoryState, name: s, inputValue: s }));
        return { ...defaultCategoryState, name: d.category, inputValue: d.category, subcategories: subs };
      });
      console.log(JSON.stringify({fetchCategoriesData: data}))
      return categoriesData;
    }
  }
  return Array.from({ length: 10 }, () => ({ ...defaultCategoryState, name: "", inputValue: "" }));
}


export default function Settings() {
  const { account, accountIsLoading, accountError } = useAccount();

  const state = useHookstate<Category[]>(async() => []);

  if(accountIsLoading) return <AccountIsLoading />
  if(!account) return <AccountNotLoggedIn />;
  else {
    if(!state.promised && !state.length && state.length !== 10) { // init state
      state.set(async() => fetchCategories(account));
    }
  }

  async function handleUpload(i: number, name: string) {
    const rootCategories = state.map((cat: State<Category>) => cat.name.value);
    rootCategories[i] = name;
    if(!rootCategories || rootCategories.length !== 10) {
      return console.error("No categories submitted to update...? What are you doing over there?");
    }
    const res = await fetch("/api/account/top-10", {
      method: "POST",
      body: JSON.stringify({ rootCategories })
    });

    state.set(async()=>fetchCategories(account, true));
  }

  const nonEmptyCategories = ((!state.promised && state.length)
    ? state.map((cat: State<Category>) => cat.name.value).filter(x => x)
    : []
  );

  return (
    <div className="prose-sm grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="min-w-0 flex-1">
        <h1 className="">
          Manage Category Hierarchy
        </h1>
        <h2 className="">
          Top-Level Categories ({nonEmptyCategories.length})
        </h2>
      </div>
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <ol className="list-outside pl-6 list-decimal text-sm/6 text-center sm:text-left space-y-6">
          {(!state.promised && state.value) &&
            state.map((cat: State<Category>, i: number) => (
              <li key={i} className="tracking-[-.01em] text-sm font-medium text-gray-900 cursor-default">
                <Item categoryState={cat} idx={i} handleUpload={handleUpload} />
              </li>
            )
          )}
        </ol>
      </main>
    </div>
  );
}
