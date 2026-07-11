// App Form Schemas

export interface FormField {
  type: string;
  title: string;
  description?: string;
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  enum?: string[] | number[];
  enumNames?: string[];
  items?: any;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export interface FormSchema {
  title: string;
  description?: string;
  type: string;
  properties: Record<string, FormField>;
  required: string[];
}

export interface UISchemaField {
  "ui:widget"?: string;
  "ui:options"?: Record<string, any>;
  "ui:placeholder"?: string;
  "ui:help"?: string;
  "ui:description"?: string;
}

export interface FormDefinition {
  schema: FormSchema;
  uiSchema: Record<string, UISchemaField>;
  mutation: string;
  successMessage: string;
  errorMessage?: string;
}

export const formSchemas: Record<string, FormDefinition> = {
 

  // Report Issue Form
  reportIssue: {
    schema: {
      title: "Report an Issue",
      description: "Report a problem with a ride or user",
      type: "object", 
      properties: {
        issueType: {
          type: "string",
          title: "Issue Type",
          enum: ["safety_concern", "inappropriate_behavior", "no_show", "vehicle_condition", "payment_dispute", "other"],
          enumNames: ["Safety Concern", "Inappropriate Behavior", "No Show", "Vehicle Condition", "Payment Dispute", "Other"]
        },
        incident: {
          type: "string",
          title: "Incident Description",
          maxLength: 2000
        },
        occurred: {
          type: "string",
          title: "When did this occur?",
          format: "datetime-local"
        },
        severity: {
          type: "string",
          title: "Severity Level",
          enum: ["minor", "moderate", "serious", "critical"],
          enumNames: ["Minor", "Moderate", "Serious", "Critical"]
        }
      },
      required: ["issueType", "incident", "occurred", "severity"]
    },
    uiSchema: {
      issueType: { "ui:widget": "select" },
      incident: { "ui:widget": "textarea" },
      occurred: { "ui:widget": "datetime" },
      severity: { "ui:widget": "select" }
    },
    mutation: "reportIssue",
    successMessage: "Your report has been submitted."
  },

 
};

// Utility Functions
export function getFormSchema(formName: string): FormDefinition | undefined {
  return formSchemas[formName];
}

export function getAvailableFormNames(): string[] {
  return Object.keys(formSchemas);
}

export function validateFormData(
  formName: string,
  data: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const formDef = getFormSchema(formName);
  if (!formDef) {
    return { isValid: false, errors: { form: "Form definition not found" } };
  }

  const errors: Record<string, string> = {};
  const { schema } = formDef;

  // Check required fields
  for (const requiredField of schema.required) {
    if (!data[requiredField] || data[requiredField] === "") {
      const fieldDef = schema.properties[requiredField];
      errors[requiredField] = `${fieldDef?.title || requiredField} is required`;
    }
  }

  // Validate field constraints
  for (const [fieldName, fieldData] of Object.entries(data)) {
    const fieldDef = schema.properties[fieldName];
    if (!fieldDef || (!fieldData && !schema.required.includes(fieldName))) {
      continue;
    }

    const value = fieldData;

    switch (fieldDef.type) {
      case "string":
        if (typeof value !== "string") continue;
        
        if (fieldDef.minLength && value.length < fieldDef.minLength) {
          errors[fieldName] = `${fieldDef.title} must be at least ${fieldDef.minLength} characters`;
        }
        if (fieldDef.maxLength && value.length > fieldDef.maxLength) {
          errors[fieldName] = `${fieldDef.title} must be less than ${fieldDef.maxLength} characters`;
        }
        if (fieldDef.pattern && !new RegExp(fieldDef.pattern).test(value)) {
          errors[fieldName] = `${fieldDef.title} format is invalid`;
        }
        if (fieldDef.enum && !fieldDef.enum.some(enumVal => String(enumVal) === String(value))) {
          errors[fieldName] = `${fieldDef.title} must be one of: ${fieldDef.enumNames?.join(", ") || fieldDef.enum.join(", ")}`;
        }
        break;

      case "number":
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (isNaN(numValue)) {
          errors[fieldName] = `${fieldDef.title} must be a valid number`;
          continue;
        }
        if (fieldDef.minimum !== undefined && numValue < fieldDef.minimum) {
          errors[fieldName] = `${fieldDef.title} must be at least ${fieldDef.minimum}`;
        }
        if (fieldDef.maximum !== undefined && numValue > fieldDef.maximum) {
          errors[fieldName] = `${fieldDef.title} must be at most ${fieldDef.maximum}`;
        }
        break;
    }
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
