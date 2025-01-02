"use client";
import { type MouseEventHandler, useCallback, useState } from "react";
import { CalcButton } from "./button";
import { set } from "zod";

enum Operator {
  Add = "+",
  Subtract = "-",
  Multiply = "*",
  Divide = "/",
}

export function Calc() {
  const [left, setLeft] = useState<bigint>(BigInt(0));
  const [right, setRight] = useState<bigint>(BigInt(0));
  const [outputToDisplay, setOutputToDisplay] = useState<string>("0");
  const [operator, setOperator] = useState<Operator>();

  const inputNumber: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      const number = event.currentTarget.getAttribute("data-value");

      if (!number) {
        return;
      }

      const bigNumber =
        right === BigInt(0) ? number : `${right}${BigInt(number)}`;

      if (!operator) {
        if (left === BigInt(0)) {
          setLeft(BigInt(number));
          setOutputToDisplay(number);
          return;
        }

        const result = `${left}${number}`;

        setOutputToDisplay(result);
        setLeft(BigInt(result));

        return;
      }

      setOutputToDisplay(`${left} ${operator} ${bigNumber}`);
      setRight(BigInt(bigNumber));
    },
    [operator, left, right]
  );

  const calculate: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      const value = event.currentTarget.getAttribute("data-value");

      if (!operator) {
        setOperator(value as Operator);
        return;
      }

      if (left === BigInt(0) || right === BigInt(0)) {
        return;
      }

      if (operator === Operator.Add) {
        const result = left + right;
        setLeft(result);
        setRight(BigInt(0));
        setOutputToDisplay(`${left} + ${right} = ${result}`);
      }

      if (operator === Operator.Subtract) {
        const result = left - right;
        setLeft(result);
        setRight(BigInt(0));
        setOutputToDisplay(`${left} - ${right} = ${result}`);
      }

      if (operator === Operator.Multiply) {
        const result = left * right;
        setLeft(result);
        setRight(BigInt(0));
        setOutputToDisplay(`${left} * ${right} = ${result}`);
      }

      if (operator === Operator.Divide) {
        const result = left / right;
        setLeft(result);
        setRight(BigInt(0));
        setOutputToDisplay(`${left} / ${right} = ${result}`);
      }
    },
    [operator, left, right]
  );

  return (
    <div className="grid grid-cols-4 gap-2">
      <span className="col-span-4">{outputToDisplay}</span>
      <CalcButton data-value="7" onClick={inputNumber}>
        7
      </CalcButton>
      <CalcButton data-value="8" onClick={inputNumber}>
        8
      </CalcButton>
      <CalcButton data-value="9" onClick={inputNumber}>
        9
      </CalcButton>
      <CalcButton data-value="+" onClick={calculate}>
        +
      </CalcButton>
      <CalcButton data-value="4" onClick={inputNumber}>
        4
      </CalcButton>
      <CalcButton data-value="5" onClick={inputNumber}>
        5
      </CalcButton>
      <CalcButton data-value="6" onClick={inputNumber}>
        6
      </CalcButton>
      <CalcButton data-value="-" onClick={calculate}>
        -
      </CalcButton>
      <CalcButton data-value="1" onClick={inputNumber}>
        1
      </CalcButton>
      <CalcButton data-value="2" onClick={inputNumber}>
        2
      </CalcButton>
      <CalcButton data-value="3" onClick={inputNumber}>
        3
      </CalcButton>
      <CalcButton data-value="*" onClick={calculate}>
        *
      </CalcButton>
      <CalcButton data-value="0" className="col-span-2" onClick={inputNumber}>
        0
      </CalcButton>
      <CalcButton data-value="/" onClick={calculate}>
        /
      </CalcButton>
      <CalcButton data-value="=" onClick={calculate}>
        =
      </CalcButton>
    </div>
  );
}
