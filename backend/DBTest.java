import java.sql.Connection;
import java.sql.DriverManager;

public class DBTest {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/neurofleetx_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pass = "root@123";
        try {
            System.out.println("Connecting to: " + url);
            Connection conn = DriverManager.getConnection(url, user, pass);
            System.out.println("SUCCESS: Connected to database!");
            conn.close();
        } catch (Exception e) {
            System.err.println("FAILURE: Could not connect to database.");
            e.printStackTrace();
        }
    }
}
