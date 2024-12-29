import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, s3Url, status } = await request.json();

    const result = await sql`
      INSERT INTO documents (user_id, file_name, s3_url, status)
      VALUES (${session.user.id}, ${fileName}, ${s3Url || ""}, ${status})
      RETURNING document_id
    `;

    return NextResponse.json({ documentId: result[0].document_id });
  } catch (error) {
    console.error("Error creating document record:", error);
    return NextResponse.json(
      { error: "Failed to create document record" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, s3Url, status } = await request.json();

    // Update based on what fields are provided
    if (status && s3Url) {
      await sql`
        UPDATE documents 
        SET status = ${status},
            s3_url = ${s3Url},
            updated_at = CURRENT_TIMESTAMP
        WHERE document_id = ${documentId} 
        AND user_id = ${session.user.id}
      `;
    } else if (status) {
      await sql`
        UPDATE documents 
        SET status = ${status},
            updated_at = CURRENT_TIMESTAMP
        WHERE document_id = ${documentId} 
        AND user_id = ${session.user.id}
      `;
    } else if (s3Url) {
      await sql`
        UPDATE documents 
        SET s3_url = ${s3Url},
            updated_at = CURRENT_TIMESTAMP
        WHERE document_id = ${documentId} 
        AND user_id = ${session.user.id}
      `;
    } else {
      await sql`
        UPDATE documents 
        SET updated_at = CURRENT_TIMESTAMP
        WHERE document_id = ${documentId} 
        AND user_id = ${session.user.id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating document record:", error);
    return NextResponse.json(
      { error: "Failed to update document record" },
      { status: 500 }
    );
  }
}
