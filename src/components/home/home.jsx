import { Card, Divider } from "@blueprintjs/core";
import "./home.css";
import placeholder from "./male-placeholder-image.jpeg";

const Home = () => {
  return (
    <div>
      <div className="card">
        <Card elevation={3}>
          <div className="card-main">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            efficitur quam vitae ex molestie, et dapibus lacus venenatis. Donec
            nec hendrerit erat. Ut imperdiet, mauris nec ultricies condimentum,
            est nibh dictum purus, non gravida arcu purus quis sem. Proin
            commodo, quam vel facilisis hendrerit, nunc felis luctus eros, sit
            amet viverra nisl purus et dolor. Vivamus quis egestas magna, quis
            elementum mauris. Etiam tincidunt eros id felis vehicula maximus.
            Proin aliquam sed orci a accumsan. Mauris a dolor turpis. Interdum
            et malesuada fames ac ante ipsum primis in faucibus. Integer
            accumsan nunc in venenatis suscipit. Nulla facilisi.
            <Divider />
            <img src={placeholder} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
