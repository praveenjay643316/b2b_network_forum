import React from "react";
import chatIcon from '../../assets/images/icons/ChatBc.png'
import { MdCircle, MdPointOfSale } from "react-icons/md";
const PageHeader = ({title}) => {
  return (
    <div className="card  rounded-md bg-lightinfo dark:bg-darkinfo shadow-none dark:shadow-none position-relative overflow-hidden mb-6">
      <div className="card-body p-2">
        <div className=" items-center grid grid-cols-12 gap-6">
          <div className="col-span-9">
            <h4 className="font-semibold text-xl text-dark dark:text-white mb-3">
              {title}
            </h4>
            <ol
              className="flex items-center gap-3 whitespace-nowrap"
              aria-label="Breadcrumb"
            >
              <li className="flex items-center">
                <a
                  className="opacity-80 text-sm text-link dark:text-darklink leading-none"
                  href="/"
                >
                  Home
                </a>
              </li>
              <li>
                <MdCircle size={6}/>
              </li>
              <li
                className="flex items-center text-sm text-link dark:text-darklink leading-none"
                aria-current="page"
              >
                {title}
              </li>
            </ol>
          </div>
          <div className="col-span-3 -mb-10">
            <div className="flex justify-center">
              <img
                src={chatIcon}
                className="md:-mb-10 -mb-4 h-full w-32"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
