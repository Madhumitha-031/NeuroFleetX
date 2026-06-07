import java.sql.*;

public class SchemaCheck {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/neurofleetx_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pass = "root@123";
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getColumns(null, null, "agent_availability", null);
            System.out.println("Columns in agent_availability:");
            while (rs.next()) {
                System.out.println(rs.getString("COLUMN_NAME") + " (" + rs.getString("TYPE_NAME") + ")");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
