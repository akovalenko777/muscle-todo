import { Link } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function IndexPage() {
  return (
    <div className="index-page page-center">
      <Card variant="outlined" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
            Велком до канбан дошки :)
          </Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', marginBottom: 2 }}>
            <Button variant="contained" component={Link} to="/login" color="primary">Увійти</Button>
            <Button variant="contained" component={Link} to="/register" color="secondary">Зареєструватися</Button>
          </Stack>
          <Typography gutterBottom>
            або використати свій обліковий запис Google
          </Typography>
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  )
}