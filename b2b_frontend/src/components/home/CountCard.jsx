import React from "react";
import bt from "../../assets/images/icons/icon-white-bitcoin.svg";

const CountCard = ({count,icon,title}) => {
  return (
    <div className="lg:col-span-3 md:col-span-6 sm:col-span-6 col-span-12">
      <div className="card shadow-none bg-purple-200 dark:bg-purple-800 w-full rounded-md">
        <div className="card-body p-5">
          <div className="flex items-center">
            <div className="rounded-md bg-primary w-11 h-11 flex items-center justify-center">
              {icon}
            </div>
            <h6 className="mb-0 ms-3">{title}</h6>
            <div className="ms-auto flex gap-1 items-center">
              <i className="ti ti-trending-up text-primary text-xl" />
              <span className="text-xs font-semibold">
                  <h3 className="text-2xl">{count}</h3>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountCard;
