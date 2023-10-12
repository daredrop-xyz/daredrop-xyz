import classNames from "classnames";
import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import FocusTrap from "focus-trap-react";



//export const ModalPortalContainer = ({ children }: { children: ReactNode }) => {
//    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
//        null
//    );
//
//    useEffect(() => {
//        const container = document.getElementById("modal-portal-container");
//        if (!container) {
//            console.error(new Error("modal portal container node unreachable"));
//        }
//
//        setPortalContainer(container);
//    }, []);
//
//    if (portalContainer === null) {
//        return null;
//    }
//
//    return createPortal(children, portalContainer);
//};
//
//
type Props = {
    title?: string;
    children: ReactNode;
    close: () => void;
    className?: string;
    position?: string;
    bg?: string;
    tstyle?: string;
};

const modalClasses = "h-[200px] w-[600px] bg-gray-800 relative top-20" ;
const positionClasses = "fixed top-0 left-0 w-full h-full flex flex-col items-center justify-around m-auto";

const Modal = ({ title, children, close, className, position, bg, tstyle }: Props) => {
    return (
                <div className={classNames(positionClasses)}>
                    <div
                        className={classNames("absolute top-0 left-0 bg-slate-700 opacity-70 z-10 w-full h-full", bg)}
                        onClick={close}
                    />
                    <div className={classNames("z-20", position)}>
                        <div className="flex flex-col text-center justify-around align-center">
                            <h4 className={classNames("text-3xl underline font-bold",tstyle)}>{title}</h4>
                            {/* 
                            <span
                                icon="cross"
                                className="border-0 border-l-1 border-solid border-gray-500 bg-red-800"
                                onClick={close}
                            />
                            */}
                        </div>
                        <div className={classNames(className, modalClasses)}>{children}</div>
                    </div>
                </div>
            );
};

//export const PortalizedModal = (props: Props) => (
//    <ModalPortalContainer>
//        <Modal {...props} />
//    </ModalPortalContainer>
//);

export default Modal;
