"use client";

import type { AttributeFilterOption } from "@/types/Product.types";
import Collapsible from "@gratia/ui/components/Collapsible";
import AttributeFilterBoolean from "./AttributeFilterBoolean";
import AttributeFilterEnum from "./AttributeFilterEnum";
import AttributeFilterNumber from "./AttributeFilterNumber";

interface AttributeFilterSectionProps {
  attribute: AttributeFilterOption;
}

export default function AttributeFilterSection({
  attribute,
}: AttributeFilterSectionProps) {
  const { key, label, type, values } = attribute;

  if (!values?.length) return null;

  const renderContent = () => {
    switch (type) {
      case "enum":
      case "string":
        return <AttributeFilterEnum attributeKey={key} values={values} />;
      case "number":
        return <AttributeFilterNumber attributeKey={key} values={values} />;
      case "boolean":
        return <AttributeFilterBoolean attributeKey={key} values={values} />;
      default:
        return <AttributeFilterEnum attributeKey={key} values={values} />;
    }
  };

  return (
    <Collapsible trigger={label} defaultOpen>
      {renderContent()}
    </Collapsible>
  );
}
