import React, { useMemo, useRef, useState } from "react";
import { cn } from "../../config/utils";
import { div } from "motion/react-client";

export const BackgroundRippleEffect = ({
    rows = 14,
    cols = 30,
    cellSize = 60,
}) => {
    const [clickedCell, setClickedCell] = useState(null);
    const [rippleKey, setRippleKey] = useState(0);
    const ref = useRef(null);

    return (
        <div className="h-full w-full overflow-hidden dark:bg-dark-bg">
            <div
                ref={ref}
                className={cn(
                    "absolute inset-0 h-full w-full",
                    "[--cell-border-color:var(--color-neutral-400)] [--cell-fill-color:var(--color-neutral-200)] [--cell-shadow-color:var(--color-neutral-500)]",
                    "dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-900)] dark:[--cell-shadow-color:var(--color-neutral-800)]"
                )}>
                <div className="relative h-auto w-auto overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
                    <DivGrid
                        key={`base-${rippleKey}`}
                        className="mask-radial-from-1% mask-radial-at-top"
                        rows={rows}
                        cols={cols}
                        cellSize={cellSize}
                        borderColor="var(--cell-border-color)"
                        fillColor="var(--cell-fill-color)"
                        clickedCell={clickedCell}
                        onCellClick={(row, col) => {
                            setClickedCell({ row, col });
                            setRippleKey((k) => k + 1);
                        }}
                        interactive
                    />
                </div>
            </div>
        </div>
    );
};

const DivGrid = ({
    className,
    rows = 4,
    cols = 20,
    cellSize = 56,
    borderColor = "#3f3f46",
    fillColor = "rgba(14,165,233,0.3)",
    clickedCell = null,
    onCellClick = () => {},
    interactive = true,
}) => {
    const cells = useMemo(
        () => Array.from({ length: rows * cols }, (_, idx) => idx),
        [rows, cols]
    );

    const gridStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        width: cols * cellSize,
        height: rows * cellSize,
        marginInline: "auto",
    };

    return (
        <div className={cn("relative z-[3]", className)} style={gridStyle}>
            {cells.map((idx) => {
                const rowIdx = Math.floor(idx / cols);
                const colIdx = idx % cols;
                const distance = clickedCell
                    ? Math.hypot(
                          clickedCell.row - rowIdx,
                          clickedCell.col - colIdx
                      )
                    : 0;
                const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
                const duration = 200 + distance * 80; // ms

                const style = clickedCell
                    ? {
                          "--delay": `${delay}ms`,
                          "--duration": `${duration}ms`,
                      }
                    : {};

                return (
                    <div
                        key={idx}
                        className={cn(
                            "cell relative border-[0.5px] opacity-40 transition-opacity duration-150 will-change-transform hover:opacity-80 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
                            clickedCell &&
                                "animate-cell-ripple [animation-fill-mode:none]",
                            !interactive && "pointer-events-none"
                        )}
                        style={{
                            backgroundColor: fillColor, // uses var(--cell-fill-color)
                            borderColor: borderColor, // uses var(--cell-border-color)
                            ...style,
                        }}
                        onClick={
                            interactive
                                ? () => onCellClick?.(rowIdx, colIdx)
                                : undefined
                        }
                    />
                );
            })}
        </div>
    );
};
