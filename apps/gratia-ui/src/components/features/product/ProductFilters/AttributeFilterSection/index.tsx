"use client";

import type { AttributeFilterOption } from "@/types/Product.types";
import AttributeFilterBoolean from "./AttributeFilterBoolean";
import AttributeFilterEnum from "./AttributeFilterEnum";
import AttributeFilterNumber from "./AttributeFilterNumber";
import styles from "./AttributeFilterSection.module.scss";

interface AttributeFilterSectionProps {
  attribute: AttributeFilterOption;
}

export default function AttributeFilterSection({
  attribute,
}: AttributeFilterSectionProps) {
  const { key, label, type, values } = attribute;
  const headingId = `attr-filter-${key}-heading`;

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
    <section
      className={styles.section}
      aria-labelledby={headingId}
    >
      <h3 id={headingId} className={styles.heading}>
        {label}
      </h3>
      {renderContent()}
    </section>
  );
}
